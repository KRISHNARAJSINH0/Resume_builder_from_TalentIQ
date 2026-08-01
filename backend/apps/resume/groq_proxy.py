import os
import json
import urllib.request
import urllib.error
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# API key stored as environment variable on Render - NEVER hardcode
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def groq_proxy(request):
    """
    Proxy view for Groq AI API calls.
    Keeps the API key server-side secure on Render.
    Frontend sends: { messages, model, temperature, max_tokens }
    """
    # Handle CORS preflight
    if request.method == "OPTIONS":
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    if not GROQ_API_KEY:
        return JsonResponse(
            {"error": {"message": "AI service not configured. Please contact administrator."}},
            status=503
        )

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, Exception):
        return JsonResponse({"error": {"message": "Invalid JSON body"}}, status=400)

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
            return JsonResponse(result)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="ignore")
        try:
            err_json = json.loads(err_body)
        except Exception:
            err_json = {"error": {"message": err_body}}
        return JsonResponse(err_json, status=e.code)
    except Exception as e:
        return JsonResponse({"error": {"message": str(e)}}, status=500)
