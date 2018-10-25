"use strict"; 

module.exports = function(app, MongoClient, url)
{
    function activeSection(parent, sections)
    {
        for (var i in sections)
        {
            if (parent === sections[i].id)
            {

                return sections[i].slug + "/"; 
            }
        }
    } 
        
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
   

    MongoClient.connect(url, function(err, db) 
    {
        if (err) throw err;

        db.collection("forum-topics").find().toArray(function(err, topics) 
        {
            if (err) throw err;   
            db.collection("forum-sections").find().toArray(function(err, sections) 
            {
                if (err) throw err;   

                for (var i in topics)
                {
                    let topicId = topics[i].id; 

                    app.get("/forum/"+ activeSection(topics[i].parent, sections) +topics[i].slug, function(req, res)
                    {   
                        db.collection("forum-posts").find({parent: topicId}).limit(15).skip(activePage(parseInt(req.query.page))).toArray(function(err, posts) 
                        {
                            if (err) throw err;
                            db.collection("forum-topics").find({id: topicId}).toArray(function(err, topic) 
                            {
                                if (err) throw err;    
                                db.collection("users").find().toArray(function(err, users) 
                                {
                                    if (err) throw err;    
                                    res.send(postsHtml(posts, users, topic[0], req));
                                }) 
                            })
                        })
                    })
                }
            })
        })
    })    


    function postsHtml(array, users, topic, req)
    {
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

        function loggedUserName(req, users)
        {
            if (typeof req.cookies.logged !== "undefined")
            {
                for (var i in users)
                {
                    if (users[i]._id == req.cookies.logged.substring(0, 24))
                    {
                        return users[i].id; 
                    }
                }
            }
            else
            {
                return ""; 
            }

        }        
        
        function editPost(item, req, users)
        {
            if (loggedUserName(req, users) === item.author)
            {
                return '<div class="postsInner-navMenu-edit" data-id="'+ item.id +'" onclick="editPost(this)">Редакция</div>'; 
            }
            
            else
            {
                return ""; 
            }

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

        function postsCount(topicItem)
        {
            function firstPage(req, count)
            {
                if (query === 1)
                {
                    return '<a href="'+ topicItem.slug +"?page=1"+'"><div class="topic-item-info-pages-count first isActivePage">1</div></a>'; 
                }   
                else
                {
                    return '<a href="'+ topicItem.slug +"?page=1"+'"><div class="topic-item-info-pages-count first">1</div></a>'; 
                }         
            }

            function secondPage(req, count)
            {
                if (query === 2)
                {
                    return '<a href="'+ topicItem.slug +"?page=2"+'"><div class="topic-item-info-pages-count second isActivePage">2</div></a>'; 
                }   
                else
                {
                    return '<a href="'+ topicItem.slug +"?page=2"+'"><div class="topic-item-info-pages-count second">2</div></a>'; 
                }         
            }        

            function lastPage(req, count)
            {
                if (query === count)
                {
                    return '<a href="'+ topicItem.slug + "?page=" + count +'"><div class="topic-item-info-pages-count last isActivePage">'+ count +'</div></a>';
                }   
                else
                {
                    return '<a href="'+ topicItem.slug + "?page=" + count +'"><div class="topic-item-info-pages-count last">'+ count +'</div></a>'; 
                }         
            }        

            function activePage(req, count)
            {
                if (query !== 1)
                {
                    if  (query !== count)
                    {
                        return '<a href="'+ topicItem.slug + "?page=" + query +'"><div class="topic-item-info-pages-count last isActivePage">'+ query +'</div></a>'; 
                    }
                    else return ""; 
                }
                
                else return ""; 
            }

            function arrowLeft(req, count)
            {
                if (query !== 1)
                {
                    if (query !== 2)
                    {
                        return '<a href="'+ topicItem.slug + "?page=" + (query-1) +'"><div class="topic-item-info-pages-count first"><</div></a>';   
                    }
                    return ""; 
                }
                
                else return "";             
            }        

            function emptyLeft(req, count)
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

            function emptyRight(req, count)
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

            function arrowRight(req, count)
            {
                if (query !== (count-1))
                {
                    if  (query !== count)
                    {
                        return '<a href="'+ topicItem.slug + "?page=" + (query+1) +'"><div class="topic-item-info-pages-count first">></div></a>';  
                    }
                    else return ""; 
                }
                
                else return "";             
            }            

            let count = Math.ceil(topicItem.postsCount/15); 
            let query = parseInt(req.url.split("?page=")[1]);

            if (count === 1 || count === 0)
            {
                return firstPage(req, count);             
            }    

            if (count === 2)
            {
                let html = 
                firstPage(req, count) +       
                secondPage(req, count); 
                
                return html; 
            }

            if (count === 3)
            {
                let html = 
                firstPage(req, count) + 
                secondPage(req, count) + 
                lastPage(req, count); 
                
                return html; 
            }
            
            if (count > 3)
            {
                let html = 
                arrowLeft(req, count) +            
                firstPage(req, count) +
                emptyLeft(req, count) +
                activePage(req, count) + 
                emptyRight(req, count) +            
                lastPage(req, count) +
                arrowRight(req, count); 

                return html; 

            }
        }    

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

        function avatar(user)
        {   
            for (var i in users)
            {
                if (user === users[i].id)
                {
                    return "/images/" + users[i].avatarLarge; 
                }
            }    
        }

        function posts(user)
        {
            for (var i in users)
            {
                if (user === users[i].id)
                {
                    return users[i].postsCount + users[i].commentsCount; 
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

        function newPost(topic, user, req)
        {
            var html; 

            function tagArea()
            {
                let tagArea = 
                `
                <div class="tagArea">
                    <div class="tagArea-fontStyles" onclick="fontStyles('bold')">B</div>
                    <div class="tagArea-fontStyles italic" onclick="fontStyles('italic')">i</div>
                    <div class="tagArea-emotes" onclick="smileyAreaOpen('tagArea-emotesAll')">
                        <div id="tagArea-emotesAll" class="tagArea-emotesAll">
                            <img class="smiley" alt=":)" src="/images/smiles/icon_smile.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=":arrow:" src="/images/smiles/icon_arrow.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=":D" src="/images/smiles/icon_biggrin.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=":cool:" src="/images/smiles/icon_cool.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=":sad:" src="/images/smiles/icon_cry.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=":shock:" src="/images/smiles/icon_eek.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=":exclaim:" src="/images/smiles/icon_exclaim.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=":idea:" src="/images/smiles/icon_idea.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=":lol:" src="/images/smiles/icon_lol.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=":mad:" src="/images/smiles/icon_mad.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=":mrgreen:" src="/images/smiles/icon_mrgreen.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=":neutral:" src="/images/smiles/icon_neutral.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=":question:" src="/images/smiles/icon_question.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=":oops:" src="/images/smiles/icon_redface.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=":P" src="/images/smiles/icon_razz.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=":roll:" src="/images/smiles/icon_rolleyes.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=":(" src="/images/smiles/icon_sad.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=":twisted:" src="/images/smiles/icon_twisted.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=";)" src="/images/smiles/icon_wink.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=":surprise:" src="/images/smiles/icon_surprised.gif" onclick="insertEmote(this)" />
                            <img class="smiley" alt=":evil:" src="/images/smiles/icon_evil.gif" onclick="insertEmote(this)" />
                        </div>
                    </div>                
                </div>                
                `;                

                return tagArea; 
            }

            if (loggedCheck(req, users))
            {
                html = 
                '<div class="newPost" id="newPost">'+
                tagArea() + 
                '<textarea class="newPost-textarea" id="commentBox-textarea"></textarea>'+ 
                '<button class="newPost-button" id="'+ topic.id +'" onclick="forumComment()">Коментиране</button>' +
                '<button class="newPost-button forumEdit" onclick="forumEdit()">Редакция</button>' + 
                '</div>'; 
            }
            
            else
            {
                html = '<div class="userNotLogged">Нужно е да сте регистрирани, за да пишете във форума.</div>'; 
            }


            return html; 
        }

        function firstPostAuthor(i, topic, array, itt)
        {
            if (itt === 1)
            {
                if (i === 0)
                {
                    return topic.author; 
                }

                else 
                {
                    return array[i-1].author; 
                }
            }

            else
            {
                return array[i].author; 
            }
            

        }

        function firstPostContent(i, topic, array, itt)
        {
            function insertEmotes(content)
            {
                content = content.replace(new RegExp(':\\\)', "g"), '<img class="smiley" src="/images/smiles/icon_smile.gif" />');
                content = content.replace(new RegExp(':arrow:', "g"), '<img class="smiley" src="/images/smiles/icon_arrow.gif">');
                content = content.replace(new RegExp(':D', "g"), '<img class="smiley" src="/images/smiles/icon_biggrin.gif">');
                content = content.replace(new RegExp(':cool:', "g"), '<img class="smiley" src="/images/smiles/icon_cool.gif">');
                content = content.replace(new RegExp(':sad:', "g"), '<img class="smiley" src="/images/smiles/icon_cry.gif">');
                content = content.replace(new RegExp(':shock:', "g"), '<img class="smiley" src="/images/smiles/icon_eek.gif">');
                content = content.replace(new RegExp(':exclaim:', "g"), '<img class="smiley" src="/images/smiles/icon_exclaim.gif">');
                content = content.replace(new RegExp(':idea:', "g"), '<img class="smiley" src="/images/smiles/icon_idea.gif">');
                content = content.replace(new RegExp(':lol:', "g"), '<img class="smiley" src="/images/smiles/icon_lol.gif">');
                content = content.replace(new RegExp(':mad:', "g"), '<img class="smiley" src="/images/smiles/icon_mad.gif">');
                content = content.replace(new RegExp(':mrgreen:', "g"), '<img class="smiley" src="/images/smiles/icon_mrgreen.gif">');
                content = content.replace(new RegExp(':neutral:', "g"), '<img class="smiley" src="/images/smiles/icon_neutral.gif">');
                content = content.replace(new RegExp(':question:', "g"), '<img class="smiley" src="/images/smiles/icon_question.gif">');
                content = content.replace(new RegExp(':oops:', "g"), '<img class="smiley" src="/images/smiles/icon_redface.gif">');
                content = content.replace(new RegExp(':P', "g"), '<img class="smiley" src="/images/smiles/icon_razz.gif">');
                content = content.replace(new RegExp(':roll:', "g"), '<img class="smiley" src="/images/smiles/icon_rolleyes.gif">');
                content = content.replace(new RegExp(':\\\(', "g"), '<img class="smiley" src="/images/smiles/icon_sad.gif">');
                content = content.replace(new RegExp(':twisted:', "g"), '<img class="smiley" src="/images/smiles/icon_twisted.gif">');
                content = content.replace(new RegExp(';\\\)', "g"), '<img class="smiley" src="/images/smiles/icon_wink.gif">');
                content = content.replace(new RegExp(':surprise:', "g"), '<img class="smiley" src="/images/smiles/icon_surprised.gif">');
                content = content.replace(new RegExp(':evil:', "g"), '<img class="smiley" src="/images/smiles/icon_evil.gif">');

                return content; 
            };
            
            function youTubeEmbed(content)
            {
                if (content.match(/(watch\?v=)\w+/g) !== null)
                {
                    if (content.match(/[&]\w+=\w+/g) !== null)
                    {
                        let exclude = content.match(/[&]\w+=\w+/g); 
                        
                        for (let i in exclude)
                        {
                            content = content.replace(exclude[i], ""); 
                        }
                    }

                    let embedUnclean = content.match(/(https:\/\/www.youtube.com\/watch\?v=)\w+/g); 

                    for (let i in embedUnclean)
                    {
                        let embedIndex = embedUnclean[i].match(/\?v=/).index;
                        let embed = embedUnclean[i].slice(embedIndex+3, embedUnclean[i].length);
                        if (content.match(embed) !== null)
                        {
                            let index = content.match(embed).index-32; 
                            content = content.replace(embedUnclean[i], "");
    
                            content = content.slice(0, index) + 
                            `<div class="postInner-video"><iframe width="560" height="315" src="https://www.youtube.com/embed/`+ embed +`" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>` +
                            content.slice(index, content.length);      
                        }                   
                    }
                } 

                return content; 
            }

            if (itt === 1)
            {
                if (i === 0)
                {
                    let content = topic.firstPostContent;
                    content = content.replace(new RegExp("\n \n", "g"), '\n\n');
                    content = content.replace(new RegExp("\n\n", "g"), '<p>'); 
                    content = content.replace(new RegExp("\n", "g"), '<br>');
                    content = youTubeEmbed(content); 
                    content = insertEmotes(content); 
                    
                    return content; 
                }

                else 
                {
                    let content = array[i-1].content;
                    content = content.replace(new RegExp("\n \n", "g"), '\n\n');
                    content = content.replace(new RegExp("\n\n", "g"), '<p>'); 
                    content = content.replace(new RegExp("\n", "g"), '<br>');
                    content = youTubeEmbed(content);                     
                    content = insertEmotes(content); 

                    return content;                     
                }                
            }
            else
            {
                let content = array[i].content;

                content = content.replace(new RegExp("\n \n", "g"), '\n\n');
                content = content.replace(new RegExp("\n\n", "g"), '<p>'); 
                content = content.replace(new RegExp("\n", "g"), '<br>');
                content = youTubeEmbed(content);                 
                content = insertEmotes(content); 

                return content;                       
            }
        }
        
        function firstPostDate(i, topic, array, itt)
        {
            if (itt === 1)
            {
                if (i === 0)
                {
                    return isodate(topic.date); 
                }
                else
                {
                    return isodate(array[i-1].date)
                }
            }
            else
            {
                return isodate(array[i].date)
            }
        }

        function firstPostEdit(i, topic, array, itt)
        {
            if (itt === 1)
            {
                if (i === 0)
                {
                    return ""; 
                }
                else
                {
                    return editPost(array[i-1], req, users);
                }
            }
            else
            {
                return editPost(array[i], req, users);
            }
        }

        function firstPostId(i, topic, array, itt)
        {
            if (itt === 1)
            {
                if (i === 0)
                {
                    return ""; 
                }
                else
                {
                    return array[i-1].id;
                }
            }
            else
            {
                return array[i].id;
            }
        }        

        function signature(author)
        {
            for (var i in users)
            {
                if (users[i].id === author)
                {
                    if (users[i].signature !== null)
                    {
                        return '<div class="postsInner-item-posts-signature">'+ users[i].signature +'</div>'; 
                    }
                    else 
                    {
                        return '<div class="postsInner-item-posts-signature noSignature"></div>'; 
                    }                    
                }
            }
        }

        function postsLoop(array, topic)
        {
            let query = parseInt(req.url.split("?page=")[1]);
            let stringHolder = ""; 
            let itt = 0; 

            if (query === 1)
            {
                itt = 1; 
            }

            for (var i = 0; i<array.length+itt; i+=1)
            {
                let string = 
                    
                    '<div class="postsInner-item" id="'+ firstPostId(i, topic, array, itt) +'">'+
                        '<div class="postsInner-item-author">'+
                            '<img class="postsInner-item-author-avatar" src="'+ avatar(firstPostAuthor(i, topic, array, itt)) +'"/>'+
                            '<div class="postsInner-item-author-name">'+ author(firstPostAuthor(i, topic, array, itt)) +'</div>'+
                            '<div class="postsInner-item-author-posts">'+ "Мнения: " + posts(firstPostAuthor(i, topic, array, itt)) +'</div>'+                   
                        '</div>'+
                        '<div class="postsInner-item-posts">'+
                            '<div class="postsInner-item-posts-navMenu">'+
                                '<div class="postsInner-navMenu-date">'+ firstPostDate(i, topic, array, itt) + '</div>' + 
                                firstPostEdit(i, topic, array, itt) + 
                            '</div>'+
                            '<div class="postsInner-item-posts-post">'+ firstPostContent(i, topic, array, itt) +'</div>'+
                            signature(firstPostAuthor(i, topic, array, itt)) +
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
                    '<div class="topMenu-item topMenu-forum posts">Форум</div>'+
                    '<div class="topMenu-item topMenu-activity">Последна активност</div>'+                        
                '</div>'+
                '<div class="postsInner-pagination">'+ postsCount(topic) +'</div>' + 
                '<div class="postsInner">'+  postsLoop(array, topic) +'</div>'+
                '<div class="postsInner-pagination">'+ postsCount(topic) +'</div>' +             
                newPost(topic, users, req) +
            '</div>'; 
                        

        return html; 
    }

}