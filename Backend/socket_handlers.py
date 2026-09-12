from flask import request

from flask_socketio import (
    emit,
    join_room,
)

from flask_jwt_extended import (
    decode_token,
)

from extensions import socketio


# =========================================================
# HELPERS
# =========================================================

def get_user_room(
    user_id
):

    return f"user_{user_id}"


# =========================================================
# CONNECT
# =========================================================

@socketio.on(
    "connect"
)
def handle_connect(
    auth
):

    # -----------------------------------------------------
    # AUTH OBJECT REQUIRED
    # -----------------------------------------------------

    if not isinstance(
        auth,
        dict,
    ):

        print(
            "Socket connection rejected: "
            "missing auth object."
        )

        return False


    # -----------------------------------------------------
    # TOKEN REQUIRED
    # -----------------------------------------------------

    token = auth.get(
        "token"
    )


    if not token:

        print(
            "Socket connection rejected: "
            "missing token."
        )

        return False


    # -----------------------------------------------------
    # VALIDATE JWT
    # -----------------------------------------------------

    try:

        decoded_token = decode_token(
            token
        )


        identity = decoded_token.get(
            "sub"
        )


        if identity is None:

            print(
                "Socket connection rejected: "
                "JWT identity missing."
            )

            return False


        user_id = int(
            identity
        )


    except Exception as error:

        print(
            "Socket authentication failed:",
            str(error),
        )

        return False


    # -----------------------------------------------------
    # PRIVATE USER ROOM
    # -----------------------------------------------------

    room = get_user_room(
        user_id
    )

    join_room(
        room
    )


    # -----------------------------------------------------
    # SAVE USER ID FOR CURRENT SOCKET
    # -----------------------------------------------------

    request.environ[
        "shobdo_user_id"
    ] = user_id


    print(
        f"Socket connected: "
        f"user={user_id}, "
        f"sid={request.sid}, "
        f"room={room}"
    )


    # -----------------------------------------------------
    # CONFIRM TO CLIENT
    # -----------------------------------------------------

    emit(
        "socket:ready",
        {
            "connected": True,
            "user_id": user_id,
            "room": room,
        },
    )


    return True


# =========================================================
# DISCONNECT
# =========================================================

@socketio.on(
    "disconnect"
)
def handle_disconnect():

    user_id = request.environ.get(
        "shobdo_user_id"
    )


    print(
        f"Socket disconnected: "
        f"user={user_id}, "
        f"sid={request.sid}"
    )


# =========================================================
# TEST EVENT
# =========================================================

@socketio.on(
    "socket:ping"
)
def handle_socket_ping(
    data=None
):

    user_id = request.environ.get(
        "shobdo_user_id"
    )


    if not user_id:

        return


    emit(
        "socket:pong",
        {
            "success": True,
            "user_id": user_id,
            "received": data,
        },
    )