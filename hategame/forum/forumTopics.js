"use strict"; 

module.exports = function(app, MongoClient, url)
{
    
    function activePage(pageNumber)
    {
        if (pageNumber === 1)
        { 
            return 0; 
        }

        else 
        {
            return (pageNumber-1)*15; 
        }
    }

    var sections = ["obsht", "gaming", "za-saita"];

    for (var i in sections)
    {
        app.get("/forum/"+sections[i], function(req, res)
        {
            var queryId;  

            if (req.path.split("/")[2] === "obsht")
            {
                queryId = 30693;
            }

            if (req.path.split("/")[2] === "gaming")
            {
                queryId = 30691;
            }

            if (req.path.split("/")[2] === "za-saita")
            {
                queryId = 30676;
            }    

            MongoClient.connect(url, function(err, db) {
                if (err) throw err;

                db.collection("forum-topics").find({parent: queryId}).sort({lastPostDate: -1}).limit(15).skip(activePage(parseInt(req.query.page, 10))).toArray(function(err, topics) 
                {
                    if (err) throw err;

                    db.collection("forum-topics").find({parent: queryId}).count(function(err, count)
                    {
                        if (err) throw err;            

                        db.collection("users").find().toArray(function(err, users) 
                        {
                            if (err) throw err;            
                            db.close();   
                            return res.send(topicsHtml(topics, users, req, count));
                        });                                            
                    })  
                });
            });
        })
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

    function topicsHtml(array, users, req, count)
    {

        function author(user)
        {   
            for (var i in users)
            {
                if (user === users[i].id)
                {
                    return users[i].user; 
                }
            }    
        }


        function topicPages(pagesCount)
        {
            let count = Math.ceil(parseInt(pagesCount)/15); 

            function firstPage(count)
            {
                if (query === 1)
                {
                    return '<a href="?page=1"><div class="topic-item-info-pages-count first isActivePage">1</div></a>'; 
                }   
                else
                {
                    return '<a href="?page=1"><div class="topic-item-info-pages-count first">1</div></a>'; 
                }         
            }

            function secondPage(count)
            {
                if (query === 2)
                {
                    return '<a href="?page=2"><div class="topic-item-info-pages-count second isActivePage">2</div></a>'; 
                }   
                else
                {
                    return '<a href="?page=2"><div class="topic-item-info-pages-count second">2</div></a>'; 
                }         
            }        

            function lastPage(count)
            {
                if (query === count)
                {
                    return '<a href="?page='+ count +'"><div class="topic-item-info-pages-count last isActivePage">'+ count +'</div></a>';
                }   
                else
                {
                    return '<a href="?page='+ count +'"><div class="topic-item-info-pages-count last">'+ count +'</div></a>'; 
                }         
            }        

            function activePage(count)
            {
                if (query !== 1)
                {
                    if  (query !== count)
                    {
                        return '<a href="?page='+ query +'"><div class="topic-item-info-pages-count last isActivePage">'+ query +'</div></a>'; 
                    }
                    else return ""; 
                }
                
                else return ""; 
            }

            function arrowLeft(count)
            {
                if (query !== 1)
                {
                    if (query !== 2)
                    {
                        return '<a href="?page='+ (query-1) +'"><div class="topic-item-info-pages-count first"><</div></a>';   
                    }
                    return ""; 
                }
                
                else return "";             
            }        

            function emptyLeft(count)
            {
                if (query !== 1)
                {
                    if (query !== 2)
                    {                
                        return '<div class="topic-item-info-pages-count mid">...</div>';
                    } 
                    return ""; 
                }
                
                else return "";             
            }

            function emptyRight(count)
            {
                if (query !== (count-1))
                {
                    if  (query !== count)
                    {
                        return '<div class="topic-item-info-pages-count mid">...</div>'; 
                    }
                    else return ""; 
                }
                
                else return "";             
            }        

            function arrowRight(count)
            {
                if (query !== (count-1))
                {
                    if  (query !== count)
                    {
                        return '<a href="?page='+(query+1)+'"><div class="topic-item-info-pages-count first">></div></a>';  
                    }
                    else return ""; 
                }
                
                else return "";             
            }            

            let query = parseInt(req.url.split("?page=")[1]);

            if (count === 1)
            {
                firstPage(count);             
            }    

            if (count === 2)
            {
                let html = 
                firstPage(count) +       
                secondPage(count); 
                
                return html; 
            }

            if (count === 3)
            {
                let html = 
                firstPage(count) + 
                secondPage(count) + 
                lastPage(count); 
                
                return html; 
            }
            
            if (count > 3)
            {
                let html = 
                arrowLeft(count) +            
                firstPage(count) +
                emptyLeft(count) +
                activePage(count) + 
                emptyRight(count) +            
                lastPage(count) +
                arrowRight(count); 
                return html; 

            }            
        }

        function postsCount(topicItem)
        {

            let count = Math.ceil(topicItem.postsCount/15); 

            if (count === 1 || count === 0)
            {
                return '<a href="'+ topicItem.slug +"?page=1"+'"><div class="topic-item-info-pages-count first">1</div></a>';             
            }    

            if (count === 2)
            {
                let html = 
                '<a href="'+ topicItem.slug +"?page=1"+'"><div class="topic-item-info-pages-count first">1</div></a>'+           
                '<a href="'+ topicItem.slug + "?page=" + count +'"><div class="topic-item-info-pages-count last">'+ count +'</div></a>';
                
                return html; 
            }

            if (count === 3)
            {
                let html = 
                '<a href="'+ topicItem.slug +"?page=1"+'"><div class="topic-item-info-pages-count first">1</div></a>'+
                '<a href="'+ topicItem.slug +"?page=2"+'"><div class="topic-item-info-pages-count first">2</div></a>'+
                '<a href="'+ topicItem.slug + "?page=" + count +'"><div class="topic-item-info-pages-count last">'+ count +'</div></a>'; 
                
                return html; 
            }
            

            if (count > 3)
            {
                let html = 
                '<a href="'+ topicItem.slug +"?page=1"+'"><div class="topic-item-info-pages-count first">1</div></a>'+
                '<div class="topic-item-info-pages-count mid">...</div>'+
                '<a href="'+ topicItem.slug + "?page=" + count +'"><div class="topic-item-info-pages-count last">'+ count +'</div></a>'; 
                return html; 

            }
        }

        function newTopic(req, users)
        {
            if (loggedCheck(req, users))
            {
                return '<div class="newTopic">'+
                    '<div class="newTopic-header">Нова тема</div>'+
                    '<textarea class="newTopic-title"></textarea>'+
                    '<div class="newTopic-errorMessage"></div>'+
                    '<textarea class="newTopic-body"></textarea>'+   
                    '<button class="newTopic-publish" onclick="publishTopic(this)">Публикуване</button>'+                                    
                '</div>';      
            }

            else 
            {
                return '<div class="newTopic-unlogged">Трябва да сте регистрирани, за да пускате нови теми във форума</div>';   
            }
        }
        
        function topicsLoop(array)
        {

            let stringHolder = ""; 
            for (var i in array)
            {
                let string = 
                '<div class="topic-item">'+
                    '<div class="topic-item-info">'+
                        '<a href="'+ array[i].slug +"?page=1"+'"><div class="topic-item-info-title">'+ array[i].title +'</div></a>'+
                        '<div class="topic-item-info-author">'+ author(array[i].author) +'</div>'+
                        '<div class="topic-item-info-pages">'+ postsCount(array[i]) +'</div>'+
                    '</div>'+
                    '<div class="topic-item-posts">'+ (array[i].postsCount+1) +'</div>'+
                    '<div class="topic-item-activity">'+
                        '<div class="topic-item-activity-date">'+ isodate(array[i].lastPostDate) +'</div>'+
                        '<div class="topic-item-activity-poster">'+ author(array[i].lastPoster) +'</div>'+
                    '</div>'+                
                '</div>'; 

                stringHolder = stringHolder.concat(string); 
            }
            return stringHolder; 
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
                    '<div class="topMenu-item topMenu-forum topic">Форум</div>'+
                    '<div class="topMenu-item topMenu-posts topic">Мнения</div>'+
                    '<div class="topMenu-item topMenu-activity topic">Последна активност</div>'+                        
                '</div>'+

                '<div class="topics">'+ topicsLoop(array, users) +'</div>'+
                
                '<div class="topics-pagination">'+ topicPages(count) +'</div>'+             
                newTopic(req, users); 
            '</div>'+
        '</div>';            

        return html; 
    }    

}

