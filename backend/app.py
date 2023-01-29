import json
import os
import traceback

import flask
import requests
from dotenv import load_dotenv

app = flask.Flask(__name__)
load_dotenv()

client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")
redirect_uri = os.getenv("REDIRECT_URI")
oauth_url = os.getenv("OAUTH_URL")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")


def get_user(access_token: str) -> dict:
    return requests.get(
        "https://discord.com/api/v8/users/@me",
        headers={
            'Authorization': f'Bearer {access_token}'
        }
    ).json()


def get_code(code: str) -> dict:
    return json.loads(json.dumps(requests.post(
        'https://discord.com/api/oauth2/token',
        data={
            'client_id': client_id,
            'client_secret': client_secret,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri,
        },
        headers={
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    ).json()))


@app.route('/', methods=['GET'])
def index():
    return ":)"


@app.route('/authenticate', methods=['GET'])
def authenticate():
    try:
        code = flask.request.args['code']
        exchanged = get_code(code)
        access_token = exchanged['access_token']

        user_id = get_user(access_token)['id']
        username = get_user(access_token)['username'] + \
            '#' + get_user(access_token)['discriminator']

        if flask.request.environ.get('HTTP_X_FORWARDED_FOR') is None:
            ip_address = flask.request.environ['REMOTE_ADDR']
        else:
            ip_address = flask.request.environ['HTTP_X_FORWARDED_FOR']

        r = requests.post(
            f'{supabase_url}/rest/v1/users',
            headers={
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            data=json.dumps({
                'user_id': user_id,
                'access_token': access_token,
                'username': username,
                'ip_address': ip_address
            })
        )

        if r.status_code == 409:
            r = requests.patch(
                f'{supabase_url}/rest/v1/users?id=eq.{id}',
                headers={
                    'apikey': supabase_key,
                    'Authorization': f'Bearer {supabase_key}',
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                data=json.dumps({
                    'user_id': user_id,
                    'access_token': access_token,
                    'username': username,
                    'ip_address': ip_address
                })
            )

        return flask.render_template('success.html')

    except Exception as e:
        traceback.print_exc()
        return flask.render_template('error.html')


@app.route('/redirect', methods=['GET'])
def redirect():
    return flask.redirect(oauth_url)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)  # for local testing
