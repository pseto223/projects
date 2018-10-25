"use strict"; 

module.exports = function(app, MongoClient, url)
{
    app.get("/forum", function(req, res)
    {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;

                db.collection("forum-sections").find().toArray(function(err, sections) 
                {
                    db.collection("forum-topics").find().toArray(function(err, topics) 
                    {
                        db.collection("users").find().toArray(function(err, users) 
                        {            
                            return res.send(forumHtml(sections, topics, users, req));
                        });
                    });
            });
        });
    })


    function forumHtml(sections, topics, users, req)
    {
    
        function topicCount(section)
        {

            let count = 0; 
            for (var i in topics)
            {
                if (section.id === topics[i].parent)
                {
                    count = count+1; 
                }
            }
            return count; 
        }

        function postsCount(section)
        {
            let count = 0; 
            for (var i in topics)
            {
                if (section.id == topics[i].parent)
                {
                    count = count+topics[i].postsCount; 
                }
            }
            return count;         
        }

        function lastPoster(poster)
        {
            for (var i in users)
            {
                if (poster === users[i].id)
                {
                    return users[i].user; 
                }
            }
        }

        function loggedCheck(req, users)
        {
            for (var i in users)
            {
                if (users[i]._id+users[i].id === req.cookies.logged)
                {
                    return true; 
                }
            }
        }        

        function isodate(dateObj)
        {

            let month; 
            let date = String(dateObj).split(" "); 

            let monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]; 
            let monthsBg = ["януари", "февруари", "март", "април", "май", "юни", "юли", "август", "септември", "октомври", "ноември", "декември"]; 

            for (var i in monthsEn)
            {
                if (date[1] === monthsEn[i])
                {
                    month = monthsBg[i]; 
                }
            }

            return date[2] + " " + month + " " + date[3]; 
        }        

        function commentBox(req, users)
        {
            var html; 

            if (loggedCheck(req, users))
            {

                var id = req.cookies.logged.substring(0, 24); 
                var user; 

                for (var i in users)
                {
                    if (users[i]._id == id)
                    {
                        user = users[i]; 
                    }
                }

        
                return html = 
                '<div class="commentBox-topLogged">'+
                    '<div class="commentBox-button unselectable">'+ user.user +'</div>'+
                    '<div class="commentBox-button last-activity unselectable" onclick="lastActivity()">Последна дейност</div>'+
                    '<div id="commentBox-lastActivityArea" class="commentBox-lastActivityArea"></div>'+                     
                    '<a href="/profile"><div class="commentBox-button unselectable">Настройки</div></a>'+
                '</div>'+
                '<div class="commentBox-bottomLogged">'+
                    '<img class="commentBox-bottomLogged-image" src="'+ "/images/" + user.avatarLarge +'" />'+
                    '<textarea class="commentBox-textarea"></textarea>'+
                    '<div class="commentBox-commentButtons">'+
                        '<button class="commentBox-commentButton" onclick="publishPost()">Коментиране</button>'+
                        '<a href="/logout"><div class="commentBox-button logout unselectable">Излизане</div></a>'+
                    '</div>'+
                '</div>'; 

            }

            else 
            {
                html = 
                '<div class="commentBox-top">'+          
                    '<div class="commentBox-button login unselectable" id="loginButton">Влизане</div>'+
                    '<div class="commentBox-button register unselectable" id="registerButton">Регистрация</div>'+
                '</div>'+
                
                '<div class="commentBox-login isOpened">'+
                    '<div class="commentBox-errorBox"></div>'+
                    '<div class="commentBox-text">Потребителско име или ник</div>'+
                    '<input type="text" class="commentBox-loginField" placeholder="Потребителско име" />'+
                    '<div class="commentBox-text">Парола</div>'+
                    '<input type="password" class="commentBox-passwordField" placeholder="Парола" />'+
                    '<input type="submit" class="commentBox-loginButton" value="Влизане" onclick="loginForm()" />'+
                '</div>'+            

                '<div class="commentBox-register">'+
                    '<div class="commentBox-errorBox"></div>'+
                    '<div class="commentBox-text">Потребителско име</div>'+
                    '<input type="text" class="commentBox-registerUser" placeholder="Потребителско име" />'+
                    '<div class="commentBox-text">Парола</div>'+
                    '<input type="password" class="commentBox-registerPassword" placeholder="Парола" />'+
                    '<div class="commentBox-text">Парола (отново)</div>'+
                    '<input type="password" class="commentBox-registerPasswordRepeat" placeholder="Парола (отново)" />'+
                    '<div class="commentBox-text">Имейл</div>'+
                    '<input type="email" class="commentBox-registerEmail" placeholder="Имейл" />'+                                
                    '<input type="submit" class="commentBox-loginButton" value="Влизане" onclick="registerForm()" />'+
                '</div>';
            }
            

            return html; 
        }

        var html = 
        '<head>'+
        '<link rel="stylesheet" type="text/css" href="/css/style.css">'+
        '<script src="/scripts/scripts-forum.js"></script>'+
        `<script async src="https://www.googletagmanager.com/gtag/js?id=UA-27198605-1"></script>
        <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        
        gtag('config', 'UA-27198605-1');
        </script>`+
        '</head>'+
        '<div class="holder-forum">'+

        '<div class="title">'+
            '<a href="/"><img src="/images/logo.png" /></a>'+
        '</div>'+
                
        '<div class="nav">'+
            '<div class="nav-item"><a href="/forum">Форум</a></div>'+
            '<div class="nav-item"><a href="/zashto-hate">Защо хейт?</div>'+
            '<div class="nav-item"><a href="/za-kategoriite">За категориите</div>'+
            '<div class="nav-item"><a href="/contact">Контакт</a></div>'+
        '</div>'+
            
            '<div class="holder-forum">'+

            '<div class="loginBox-forum">'+ commentBox(req, users) +' </div>'+  

                '<div class="topMenu">'+
                    '<div class="topMenu-item topMenu-forum section">Форум</div>'+
                    '<div class="topMenu-item topMenu-topics section">Теми</div>'+
                    '<div class="topMenu-item topMenu-posts section">Мнения</div>'+
                    '<div class="topMenu-item topMenu-activity section">Последна активност</div>'+                        
                '</div>'+

                '<div class="sections">'+
                    '<div class="section-item">'+
                        '<div class="section-item-forum">'+
                            '<a href='+ "forum/za-saita/?page=1" +'><div class="section-item-forum-title">'+ sections[0].name +'</div></a>'+
                            '<div class="section-item-forum-about">'+ sections[0].info +'</div>'+
                        '</div>'+
                        '<div class="section-item-topics">'+ topicCount(sections[0]) +'</div>'+
                        '<div class="section-item-posts">'+ postsCount(sections[0]) +'</div>'+
                        '<div class="section-item-activity">'+
                            '<div class="section-item-activity-time">'+ isodate(sections[0].lastPostDate) +'</div>'+
                            '<div class="section-item-activity-poster">'+ lastPoster(sections[0].lastPoster) +'</div>'+
                        '</div>'+
                    '</div>'+

                    '<div class="section-item">'+
                        '<div class="section-item-forum">'+
                            '<a href='+ "forum/gaming/?page=1" +'><div class="section-item-forum-title">'+ sections[1].name +'</div></a>'+
                            '<div class="section-item-forum-about">'+ sections[1].info +'</div>'+
                        '</div>'+
                        '<div class="section-item-topics">'+ topicCount(sections[1]) +'</div>'+
                        '<div class="section-item-posts">'+ postsCount(sections[1]) +'</div>'+
                        '<div class="section-item-activity">'+
                            '<div class="section-item-activity-time">'+ isodate(sections[1].lastPostDate) +'</div>'+
                            '<div class="section-item-activity-poster">'+ lastPoster(sections[1].lastPoster) +'</div>'+
                        '</div>'+
                    '</div>'+
                    
                    '<div class="section-item">'+
                        '<div class="section-item-forum">'+
                            '<a href='+ "forum/obsht/?page=1" +'><div class="section-item-forum-title">'+ sections[2].name +'</div></a>'+
                            '<div class="section-item-forum-about">'+ sections[2].info +'</div>'+
                        '</div>'+
                        '<div class="section-item-topics">'+ topicCount(sections[2]) +'</div>'+
                        '<div class="section-item-posts">'+ postsCount(sections[2]) +'</div>'+
                        '<div class="section-item-activity">'+
                            '<div class="section-item-activity-time">'+ isodate(sections[2].lastPostDate) +'</div>'+
                            '<div class="section-item-activity-poster">'+ lastPoster(sections[2].lastPoster) +'</div>'+
                        '</div>'+
                    '</div>'+        
                '</div>'+
            '</div>'+
        '</div>';


        return html; 
    }
}