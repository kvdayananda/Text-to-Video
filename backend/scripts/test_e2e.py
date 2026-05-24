import time, json
import httpx

BASE = 'http://127.0.0.1:8000'
client = httpx.Client(timeout=30.0)

# Wait for server
for i in range(20):
    try:
        r = client.get(BASE + '/')
        if r.status_code == 200:
            print('SERVER_OK')
            break
    except Exception as e:
        pass
    time.sleep(0.5)
else:
    print('SERVER_UNREACHABLE')
    raise SystemExit(1)

# Register
email = f'testuser+{int(time.time())}@example.com'
reg_payload = {'name':'Test User','email':email,'password':'secret123'}
r = client.post(BASE + '/api/auth/register', json=reg_payload)
print('REGISTER:', r.status_code, r.text)

# Login
login_payload = {'email': email, 'password':'secret123'}
r = client.post(BASE + '/api/auth/login', json=login_payload)
print('LOGIN:', r.status_code, r.text)
if r.status_code != 200:
    raise SystemExit(1)
res = r.json()
token = res.get('access_token')
if not token:
    print('NO_TOKEN')
    raise SystemExit(1)

headers = {'Authorization': f'Bearer {token}'}

# Me
r = client.get(BASE + '/api/auth/me', headers=headers)
print('ME:', r.status_code, r.text)

# Publish
pub = {'videoId':1, 'platforms':['youtube'], 'publishMode':'now'}
r = client.post(BASE + '/api/publish', json=pub, headers=headers)
print('PUBLISH:', r.status_code, r.text)

# AI script
ai_payload = {'prompt':'3 quick tips to improve productivity using AI','niche':'Technology','tone':'Viral & Punchy','length':'60s','provider':'openai'}
r = client.post(BASE + '/api/ai/script', json=ai_payload)
print('AI_SCRIPT:', r.status_code, r.text[:1000])

print('TEST_COMPLETE')
