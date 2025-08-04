from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router

def create_app() -> FastAPI:
    app = FastAPI(
        title="radGPT API",
        description="API pour l'application radGPT",
        version="1.0.0"
    )
    
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Routes
    app.include_router(router, prefix="/api")
    
    return app
