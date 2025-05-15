import streamlit as st
import requests

# Flask API URL (Change if hosted)
API_URL = "http://127.0.0.1:5000/chatbot"

# Streamlit App UI
st.set_page_config(page_title="Coupon-Hub Chatbot", layout="wide")
st.title("🛍️ Coupon-Hub: AI Chatbot for Savings!")

# Chat History
if "messages" not in st.session_state:
    st.session_state["messages"] = []

# Display Chat History
for msg in st.session_state["messages"]:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# User Input
user_input = st.chat_input("Ask me about coupons...")

if user_input:
    # Display user message
    st.session_state["messages"].append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    # Send to Backend
    try:
        response = requests.post(API_URL, json={"message": user_input}, timeout=5)
        bot_reply = response.json().get("response", "Sorry, I couldn't process that request.")
    except requests.exceptions.RequestException:
        bot_reply = "Error: Could not connect to the chatbot server."

    # Display chatbot response
    st.session_state["messages"].append({"role": "assistant", "content": bot_reply})
    with st.chat_message("assistant"):
        st.markdown(bot_reply)
