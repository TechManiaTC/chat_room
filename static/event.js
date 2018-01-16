    var socket
    // 默认进入大厅频道
    var current_room = '大厅'

    var e = function (sel) {
        return document.querySelector(sel)
    }

    var join_room = function (room) {
        clear_board()
        current_room = room
        console.log('切换房间', current_room)
        var data = {
            room: room,
        }
        socket.emit('join', data, function () {
            change_title()
        })
    }

    var change_title = function () {
        if (current_room == '') {
            var title = '聊天室 - 未加入聊天室'
        } else {
            var title = '聊天室 - ' + current_room
        }
        var tag = e("#id-rooms-title")
        tag.innerHTML = title
    }

    var clear_board = function () {
        e("#id_chat_area").value = ''
    }

    var __main = function () {
        // 初始化 websocket 的方法
        var namespace = '/chat'
        var url = `ws://${document.domain}:${location.port}${namespace}`

        console.log('connect url', url)
        socket = io.connect(url, {
            transports: ['websocket']
        })
        // on 函数用来绑定事件, connect 是连接到后端 websocket 成功的时候发生的
        socket.on('connect', function () {
            console.log('connect')
        })


        var chatArea = e('#id_chat_area')

        socket.on('status', function (data) {
            chatArea.value += `< ${data.message} >\n`
        })

        socket.on('message', function (data) {
            chatArea.value += (data.message + '\n')
        })

        // 加入默认频道
        join_room(current_room)

        var input = e('#id_input_text')
        input.addEventListener('keypress', function (event) {
            // console.log('keypress', event)
            if (event.key == 'Enter') {
                // 得到用户输入的消息
                message = input.value
                // 发送消息给后端
                var data = {
                    message: message,
                }
                socket.emit('send', data, function () {
                    // 清空用户输入
                    input.value = ''
                })

            }
        })

        // 这是切换频道的事件
        e('body').addEventListener('click', function (event) {
            var self = event.target
            if (self.classList.contains('gua-room')) {
                console.log('chaneel', self.text)
                // 离开频道
                socket.emit('leave', {}, function () {
                    console.log("leave room")
                    current_room = self.text
                    // 加入房间
                    join_room(current_room)
                })
            }
        })
    }

    __main()
