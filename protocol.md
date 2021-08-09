# HRC (HRelayChat) Protocol

This is the protocol between a HRC client and server.

Connect via websocket.

# Client -> Server

## `exist` (Client -> Server)
Defines client name. Yes, this is display name also.

    {
        "type": "exist",
        "name": "client_name"
    }

## `join_channel` (Client -> Server)
Subscribes the client to channel events.

    {
        "type": "join_channel",
        "channel": "channel_name"
    }

## `leave_channel` (Client -> Server)
Unsubscribes the client from channel events.

    {
        "type": "leave_channel",
        "channel": "channel_name"
    }

## `send_message` (Client -> Server)
Sends a message to a channel.

    {
        "type": "send_message",
        "channel": "channel_name",
        "message": "message_text"
    }

# Server -> Client

## `ok` (Server -> Client)
Response to any successful request. Possibly contains other data dependent on what the request was.

    {
        "type": "ok"
        "for": "whatever the type of the original request was"
    }

## `error` (Server -> Client)
Response to any failed request. Possibly contains other data dependent on what the request was.

    {
        "type": "error",
        "for": "whatever the type of the original request was", // could just be "error"
        "error": "error id",
        "error_readable": "human readable error message"
    }

## `message` (Server -> Client)
A message from a channel.

    {
        "type": "message",
        "channel": "channel_name",
        "message": "message_text",
        "id": unique numerical id,
        "sender": "sender_name",
        "extras": {} // stuff MIGHT exist here.
    }

# Error IDs
Might expand on this later.

    0: invalid JSON
    1: internal server error
    2: already in channel (join_channel)
    3: not in channel (leave_channel, send_message)
    4: invalid channel name (join_channel)
    5: no permission (any)
    6: unsupported request type
    7: missing or invalid parameter
    8: client hasn't sent `exist` yet
    9: name taken (exist)