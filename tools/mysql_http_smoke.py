"""Exercise real DB writes via HTTP; records only a disposable QA owner for JDBC cleanup."""
import json,uuid,secrets,sys
from pathlib import Path
from urllib.request import build_opener,HTTPCookieProcessor,Request
from urllib.parse import urlencode
from http.cookiejar import CookieJar

base=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8081'
opener=build_opener(HTTPCookieProcessor(CookieJar()))
def call(path,method='GET',body=None,form=False):
 headers={'Accept':'application/json'}
 if method!='GET':
  with opener.open(base+'/api/auth/csrf') as response:csrf=json.load(response)
  headers[csrf['headerName']]=csrf['token']
  headers['Content-Type']='application/x-www-form-urlencoded' if form else 'application/json'
  body=(urlencode(body) if form else json.dumps(body)).encode()
 with opener.open(Request(base+path,data=body,headers=headers,method=method)) as response:
  raw=response.read();return json.loads(raw) if raw else None

assert len(call('/api/catalog'))==606
email='mysql-qa-'+str(uuid.uuid4())+'@example.test';password=secrets.token_urlsafe(24)
account=call('/api/auth/register','POST',{'email':email,'displayName':'MySQL QA','password':password})
Path('var').mkdir(exist_ok=True);Path('var/mysql-qa.properties').write_text('id='+account['id']+'\nemail='+email+'\n',encoding='utf-8')
call('/api/auth/login','POST',{'email':email,'password':password},True)
saved=call('/api/progress/oll-1','PUT',{'learned':True,'favorite':True});assert saved['learned'] and saved['favorite']
call('/api/account/profile','PUT',{'displayName':'MySQL QA','level':'ADVANCED','focusPuzzle':'5x5','dailyMinutes':20})
call('/api/roadmap/stages/5x5-foundation','PUT',{'completed':True})
call('/api/auth/logout','POST')
call('/api/auth/login','POST',{'email':email,'password':password},True)
assert call('/api/auth/me')['user']['id']==account['id']
rows=call('/api/progress');assert len(rows)==1 and rows[0]['learned'] and rows[0]['favorite']
plan=call('/api/roadmap');assert plan['user']['focusPuzzle']=='5x5' and plan['stages'][0]['complete']
call('/api/auth/logout','POST')
print('MySQL HTTP smoke PASS: 606 cases, register/login, profile, learned/favorite, roadmap and return login.')
