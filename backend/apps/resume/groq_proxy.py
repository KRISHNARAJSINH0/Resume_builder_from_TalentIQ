import os
import json
import urllib.request
import urllib.error
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# API key stored as environment variable on Render
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

CORS_ORIGIN = 'https://resume-builder-from-talent-iq.vercel.app'


def _cors_response(data, status=200):
    """Create a JsonResponse with CORS headers explicitly set."""
    response = JsonResponse(data, status=status, safe=isinstance(data, dict))
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    response["Access-Control-Max-Age"] = "86400"
    return response


@csrf_exempt
def groq_proxy(request):
    """
    Proxy view for Groq AI API calls.
    Keeps the API key server-side secure on Render.
    Explicitly sets CORS headers so Vercel frontend can communicate.
    """
    # Always handle CORS preflight first
    if request.method == "OPTIONS":
        return _cors_response({})

    if request.method != "POST":
        return _cors_response({"error": {"message": "Method not allowed"}}, status=405)

    if not GROQ_API_KEY:
        return _cors_response(
            {"error": {"message": "AI service not configured on server. Add GROQ_API_KEY env var on Render."}},
            status=503
        )

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, Exception):
        return _cors_response({"error": {"message": "Invalid JSON body"}}, status=400)

    payload = {
        "model": body.get("model", "llama-3.3-70b-versatile"),
        "messages": body.get("messages", []),
        "temperature": body.get("temperature", 0.7),
        "max_tokens": body.get("max_tokens", 2048),
    }

    req_data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        GROQ_URL,
        data=req_data,
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read())
            return _cors_response(result)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="ignore")
        try:
            err_json = json.loads(err_body)
        except Exception:
            err_json = {"error": {"message": err_body}}
        return _cors_response(err_json, status=e.code)
    except Exception as e:
        return _cors_response({"error": {"message": str(e)}}, status=500)
