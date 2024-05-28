"# MediaBot" 
Just a dumb discord bot that makes channels media only.

Add it to the server, give it access to the channel in question (or add it to the channel directly), and type /media-only
The bot auto deletes any post without an embed or attachment, as long as it's not in a thread.

The bot will also remove any attachment or embed that is not of an image or video type.

Commands:\
media-channel: Toggles channel for media-only (requires manage channels permission)\
media-cleanup: Wipes all non-media from a media channel (requires manage messages permission)\
media-flash: Toggles flash mode for a channel (requires manage channels permission)\
media-status: Shows media/flash status for channel (requires manage channels permission)\


Media toggle: All non-media is deleted after 5s\
Flash: All media is deleted after 120s\

Flash and media toggles can be combined. Which will cause both media and non-media to be deleted after 120s.


Will ask for these permissions:\
Manage Messages\
Read Message History\
Read Messages/View Channels\
Send Messages
