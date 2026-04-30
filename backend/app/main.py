from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import document

app = FastAPI(
    title="Nyaya-Setu API",
    description="Backend API for Cognitive Compliance Engine",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, this should be specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(document.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to Nyaya-Setu API"}
