var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
    //res.send('<h1>Hello world</h1>');
    res.sendFile(__dirname + '/index.html');
});

http.listen(3000, () => { console.log('listening on 3000'); });

// 1、socket表示传入的一个连接，io表示所有的连接
// 2、io.on(‘事件’，function（数据)）表示触发事件执行function（）处理客户端传入的数据
// 3、io.emit（‘事件’，数据），表示向所有客户端发送一个事件和数据
// 4、如果是一个就用socket.on和socket.emit()

let users = []

io.on('connection', function(socket) {
    console.log('socket已连接')
    username = null
    socket.on('login', function(obj) { //服务端监听login事件
        if (users.length === 0) {
            users.push(obj) 
            socket.emit('loginSuccess', '成功啦')  /*登录成功*/
            username = obj.username
            socket.emit('login', obj.username) //向一个客户端发送一个事件和数据
            io.sockets.emit('add', obj.username)  /*向所有连接的客户端广播add事件*/            
        } else {
            for(var i = 0; i < users.length; i++) {
                if(users[i].username === obj.username) {
                    socket.emit('loginFailed', '名字重复啦')   /*登录失败*/
                    return
                } else {
                    users.push(obj) 
                    username = obj.username
                    socket.emit('loginSuccess', '成功啦')  /*登录成功*/
                    socket.emit('login', obj.username); //向一个客户端发送一个事件和数据
                    io.sockets.emit('add',obj.username)  /*向所有连接的客户端广播add事件*/
                    return
                }
            }
        }
    });
    socket.on('sendMessage', function(obj) {
        io.sockets.emit('receiveMessage', obj) //向所有客户端发送一个事件和数据
    });
    socket.on('disconnect', function() {
        console.log('socket已断开')
        io.sockets.emit('leave', username)
        users.map((user, index) => {
            if(user.username === username) {
                users.splice(index, 1)
            }
        })
    })
})