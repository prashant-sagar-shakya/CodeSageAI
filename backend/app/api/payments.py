import hmac
import hashlib
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session
from pydantic import BaseModel
import razorpay

from app.core.database import get_session
from app.models.user import User
from app.config import settings

router = APIRouter(prefix="/payments", tags=["Payments"])

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class OrderRequest(BaseModel):
    user_id: int
    plan: str # 'basic' or 'pro'

class VerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    user_id: int
    plan: str

# Define plan prices in paise
PLAN_PRICES = {
    "basic": 49900, # 499 INR
    "pro": 149900   # 1499 INR
}

@router.post("/create-order")
def create_order(request: OrderRequest):
    if request.plan not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Invalid plan selected")
    
    amount = PLAN_PRICES[request.plan]
    
    # Create order using Razorpay SDK
    order_data = {
        "amount": amount,
        "currency": "INR",
        "receipt": f"receipt_{request.user_id}_{request.plan}"
    }
    try:
        order = client.order.create(data=order_data)
        return {"order_id": order["id"], "amount": amount, "currency": "INR"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify")
def verify_payment(request: VerifyRequest, db: Session = Depends(get_session)):
    # Verify signature
    try:
        params_dict = {
            'razorpay_order_id': request.razorpay_order_id,
            'razorpay_payment_id': request.razorpay_payment_id,
            'razorpay_signature': request.razorpay_signature
        }
        client.utility.verify_payment_signature(params_dict)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Signature verification failed")
    
    # Upgrade user plan in DB
    user = db.get(User, request.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.subscription_tier = request.plan
    
    # Set expiration to 30 days from now
    from datetime import datetime, timedelta
    user.subscription_expires_at = datetime.utcnow() + timedelta(days=30)
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {"status": "success", "message": "Payment verified and plan upgraded", "new_tier": user.subscription_tier}
