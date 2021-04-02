import asyncio
import websockets
import json
import logging
import ssl
import pathlib
import socket
import random

# Client HOST/PLAYER <---- Server
# Client ------------> ACK Server
# Client NEW 1 <---------- Server
# Client NEW 2 <---------- Server
# Client NEW 3 <---------- Server
# Client -------------> GO Server
# Client RDY <------------ Server
# Client -------> Q [Data] Server
# Client Q [Data] <------- Server
# Client -----> RSP [Data] Server
# Client A [Data] <------- Server
# Client -------> Q [Data] Server

logging.basicConfig()

CORRECT_ANSWER = 'None'

CODES = [
    'CONN',
    'HOST',
    'PLAYER',
    'ACK',
    'NEW',
    'GO',
    'RDY',
    'Q',
    'RSP',
    'A',
    'DIS',
    'GAMEOVER'
]

QUESTION = {
    "type": "None",
    "question": "None",
    "choices": []
}

STATE = {
    'allowNewUsers': True,
    'gameInSession': False,
    'numUsers': 0,
    'awaitAnswers': False,
    'currentQuestion': QUESTION,
    'code': 'STATE',
    'responseNumber': 0
}

USERS = set()

async def register(websocket, username, userType):
    # websocket, username, score, isHost/userType
    tempUsr = [websocket, username, 0, userType]
    USERS.add(tuple(tempUsr))
    STATE['numUsers'] += 1


async def unregister(websocket):
    for user in USERS:
        if user[0] == websocket:
            USERS.remove(user)
            return


async def notify_state_change():
    for user in USERS:
        await user[0].send(json.dumps(STATE))


async def update_Question(newQ):
    QUESTION['type'] = newQ['type']
    QUESTION['question'] = newQ['question']
    global CORRECT_ANSWER
    CORRECT_ANSWER = newQ['correct_answer']
    incorrect_answers = newQ['incorrect_answers']
    allChoices = []
    for choice in incorrect_answers:
        allChoices.append(choice)
    allChoices.append(CORRECT_ANSWER)
    random.shuffle(allChoices)
    QUESTION['choices'] = allChoices


async def handle_message(message, websocket):
    data = json.loads(message)
    code = data['code']
    if code == 'ACK':
        await notify_state_change()
    elif code == 'GO':
        STATE['allowNewUsers'] = False
        for user in USERS:
            await user[0].send(json.dumps({'code': 'RDY'}))
    elif code == 'Q':
        await update_Question(data)
        await notify_state_change()
    elif code == 'USR':
        if len(USERS) == 0:
            await register(websocket, data['username'], True)
            await websocket.send(json.dumps({'code': 'HOST'}))
        else:
            await register(websocket, data['username'], False)
            await websocket.send(json.dumps({'code': 'PLAYER'}))
    elif code == 'RSP':
        if data['choice'] == CORRECT_ANSWER:
            for user in USERS:
                if user[1] == data['username']:
                    tempUser = tuple([user[0], user[1], user[2] + 1, user[3]])
                    USERS.discard(user)
                    USERS.add(tempUser)
                    break
        STATE['responseNumber'] += 1
        if STATE['responseNumber'] == STATE['numUsers']:
            STATE['responseNumber'] = 0
            userScores = []
            for user in USERS:
                userScores.append({'username': user[1], 'score': user[2]})
            for user in USERS:
                await user[0].send(json.dumps({'code': 'A', 'correctAnswer': CORRECT_ANSWER, 'scores': userScores}))


async def start(websocket, path):
    print('Connection requested')
    for user in USERS:
        if user[0] == websocket:
            return
    if STATE['allowNewUsers']:
        try:
            async for message in websocket:
                await handle_message(message, websocket)
        finally:
            await unregister(websocket)
            print('Disconnected')
            STATE['numUsers'] -= 1
            if STATE['numUsers'] == 0:
                STATE['allowNewUsers'] = True

# print(socket.gethostbyname(socket.gethostname()))
ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
cert_pem = pathlib.Path(__file__).with_name("cert.pem")
key_pem = pathlib.Path(__file__).with_name("key.pem")
ssl_context.load_cert_chain(cert_pem, keyfile=key_pem)

start_server = websockets.serve(start, "localhost", 3000)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
