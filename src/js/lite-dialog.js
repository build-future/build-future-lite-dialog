/**
 * Created by samuel on 16-6-30.
 *
 *
 *
 */
(function (window,$,_) {

    'use strict';
    if(typeof $ === 'undefined'){
        throw new Error('jQuery Is Required!');
    }
    if(typeof _ === 'undefined'){
        throw new Error('Underscore Is Required!');
    }

    var CONST_CONTENTMODE_HTML = 'html';

    var CONST_CONTENTMODE_URL = 'url';


    var LiteDialog = function (options) {

        options = options || {};

        this.options = $.extend(LiteDialog.defaultOptions,options,{
            dialogId: LiteDialog.getNextDialogId()
        });

    };


    LiteDialog.SIZES = {
        "lg":[1000,800],
        "md":[800,600],
        "sm":[500,300],
        "xs":[300,200]
    };
    LiteDialog.FOOTERBUTTONS = [
        {
            text: 'OK',
            clz: 'confirm',
            id:'footer-btn-1',
            eventName:'onOK'
        },
        {
            text: 'Cancel',
            clz: 'cancel',
            id:'footer-btn-2',
            eventName:'onCancel'
        }
    ];
    LiteDialog.ICONS = {
        "close":{
            text:'x',
            backgroundColor:'#f00',
            iconClz : 'fa fa-times-circle'
        },
        "mini":{
            text:'-',
            backgroundColor:'#f00',
            iconClz : 'fa fa-minus'
        },
        "max":{
            text:'[+]',
            backgroundColor:'#f00',
            iconClz : 'fa fa-'
        }
    };

    LiteDialog.dialogId = 1;

    LiteDialog.dialogPrefix = 'build-future-lite-dialog-';

    LiteDialog.getNextDialogId = function (){

        var _dialog_id_ = LiteDialog.dialogPrefix + LiteDialog.dialogId;
        LiteDialog.dialogId++;
        return _dialog_id_;
    };

    LiteDialog.defaultOptions = {
        version: '1.0.0',
        defaultWidth: LiteDialog.SIZES['sm'][0],
        defaultMaxHeight: LiteDialog.SIZES['sm'][1],
        icons: ['close'],
        closable: true,
        footer: true,
        footerOverrides: '',
        title: 'LiteDialog@BuildFuture',
        autoclose: false, // close if click mask
        footerBtnClose:true, // auto close after click footer button
        footerBtnIdPrefix:'build-future-',
        footerBtns: LiteDialog.FOOTERBUTTONS,
        onOK: function () {
            console.log('On OK...');
        },
        onCancel: function () {
            console.log('On Cancel...');
        },
        size: 'sm',
        showLoadingProgress: true,
        dialogId: 1,
        destroyOnClose: true,
        contentMode: 'html', // ['html','url']
        content: '<div style="width: 100%;height: 100%;text-align: center;text-align: center;font-family: \'Microsoft Yahei\';color: cornflowerblue;">Lite Dialog @BF .</div>',    // html content
        contentURL: '', // loading by url
        resized : false,
        animated:false
    };



    function getFooterButtonId(footerBtnIdPrefix,btnId){
        footerBtnIdPrefix = footerBtnIdPrefix || '';
        return footerBtnIdPrefix + btnId;
    }

    LiteDialog.prototype = {
        
        init: function () {
            this.render();
            this.resize();
            this.bindEvents();
            return this;
        },
        render: function () {

            var options = this.options;
            var dialogId = options.dialogId;
            var icons = LiteDialog.ICONS;

            var
                title = options.title,
                showFooter = options.footer,
                footerOverrides = options.footerOverrides;

            var footerHTML = '',
                iconsHTML = '';

            if(showFooter){
                if(footerOverrides && footerOverrides.trim().length >= 1){
                    footerHTML = footerOverrides;
                }else{
                    footerHTML = '<div class="footer"> \
                        <span class="btn-group">';
                    for(var i = 0; i < options.footerBtns.length; i ++){
                        var btn = options.footerBtns[i];
                        if(btn === 'close' && !options.closable){
                            continue;
                        }
                        var btnId = getFooterButtonId(options.footerBtnIdPrefix,btn.id);
                        footerHTML = footerHTML + '<button id="'+btnId+'" class="'+btn.clz+'" event-name="'+btn.eventName+'">'+btn.text+'</button>';
                    }
                    footerHTML += '</span></div>';
                }
            }

            if(options.icons && options.icons.length > 0){
                iconsHTML = '<div class="icon-set">';

                for(var j = 0 ; j < options.icons.length ; j ++){

                    var icon = options.icons[j];
                    if(!options.closable && icon === 'close'){
                        continue;
                    }
                    iconsHTML = iconsHTML + '<button class="'+icon+'" type="button"><span class="'+icons[icon].iconClz+'" aria-hidden="true"></span></button>';
                }
                iconsHTML += '</div>';
            }

            var getContent = function (options,cb) {

                if(options.contentMode === CONST_CONTENTMODE_URL){
                    var getLoadingContent = function (url,params,cb) {
                        $.load(url,params, function (responseText) {
                            if(cb && typeof cb ==='function'){
                                cb(responseText);
                            }
                        });
                    };
                    if( _.isEmpty(options.contentURL) ) return '';

                    getLoadingContent(options.contentURL,{}, cb);

                }else{
                    cb(options.content);
                }

            };


            var renderHTML = function (content) {
                var html = '<div id="'+dialogId+'" class="lite-dialog"> \
                <div class="mask"></div> \
                <div class="content-box"> \
                <div class="title"> \
                <h4> \
                <span class="title-text">'+title+'</span>' + iconsHTML +
                    '</h4> \
                    </div> \
                    <div class="content"> \
                    <div class="main"> ' + content + ' \
                    </div>' + footerHTML +
                    '</div> \
                    </div> \
                    </div>';
                $('body').append(html);
            };


            getContent(options, function (content) {
                renderHTML(content);
            });
        },
        close: function () {
            this.getDomObject().hide();
            if(this.options.destroyOnClose){
                this.destroy();
            }
        },
        destroy: function () {
            this.getDomObject().remove();
        },
        getDomObject: function (nativeNode) {
            // native html node object
            if(nativeNode){
                return $('#'+this.options.dialogId)[0];
            // jquery object
            }else{
                return $('#'+this.options.dialogId);
            }
        },
        resize : function () {

            var liteDialog =  this.getDomObject().find('.content-box');
            var options = this.options;
            if(options.size){
                var arr = LiteDialog.SIZES[options.size];
                if(_.isArray(arr) && arr.length == 2){
                    liteDialog.css('width',arr[0]);
                    liteDialog.css('min-height',arr[1]);
                }
            }

            var
                body_width = parseInt($(window).width()),
                body_height = parseInt($(window).height()),
                block_width = parseInt(liteDialog.width()),
                block_height = parseInt(liteDialog.height());

            var left_position = parseInt((body_width / 2) - (block_width / 2) + $(window).scrollLeft());
            if (body_width < block_width) {
                left_position = 0 + $(window).scrollLeft();
            }

            var top_position = parseInt((body_height / 2) - (block_height / 2) + $(window).scrollTop());
            if (body_height < block_height) {
                top_position = 0 + $(window).scrollTop();
            }

            this.getDomObject().find('.mask').css('width',$(window).width() + $(window).scrollLeft());
            this.getDomObject().find('.mask').css('height',$(window).height() + $(window).scrollTop());

            if (!this.options.resized) {

                liteDialog.css({
                    'top': top_position,
                    'left': left_position
                });
                $(window).bind('resize', function() {
                    this.resize();
                }.bind(this));
                $(window).bind('scroll', function() {
                    this.resize();
                }.bind(this));
                this.options.resized = true;

            } else {
                liteDialog.stop();
                liteDialog.animate({
                    'top': top_position,
                    'left':left_position
                }, 200, 'linear');
            }
        },
        bindEvents: function () {
            var dialog  = this.getDomObject();
            var options = this.options;

            // click close icon
            dialog.find('.icon-set .close').on('click', function () {
                this.close();
            }.bind(this));

            // click mask
            dialog.find('.mask').on('click', function () {

                var that = this;
                var options = this.options;
                if(options.autoclose){
                    that.close();
                    return;
                }
                //dialog.find('.content-box').addClass(' animated shake');

                if(!options.animated){
                    options.animated = true;
                    var width  = dialog.find('.content-box').width(),
                        height = dialog.find('.content-box').height(),
                        top = parseFloat(dialog.find('.content-box').css('top')),
                        left = parseFloat(dialog.find('.content-box').css('left'));
                    var added_w = 0.1 * width,
                        added_h = 0.1 * height;
                    dialog.find('.content-box').stop(true).animate({width:width + added_w + 'px',height:height + added_h + 'px',top:(top - added_h/2) + 'px',left:(left - added_w/2 ) + 'px'}, function () {
                        dialog.find('.content-box').animate({width:width+'px',height:height+'px',top:(top ) + 'px',left:(left ) + 'px'}, function () {
                            options.animated = false;

                        });
                    });
                }


            }.bind(this));

            var that = this;
            var footerBtns = options.footerBtns;

            $.each(footerBtns, function (index, btn) {
                $('#'+getFooterButtonId(options.footerBtnIdPrefix,btn.id)).on('click', function () {
                    var eventName = btn['eventName'];
                    if(typeof options[eventName] === 'function'){
                        options[eventName]();
                    }

                    if(options.footerBtnClose){
                        that.close();
                    }
                });
            });

        }

    };


    LiteDialog.alertDialog = function (options) {
        options = options || {};
        $.extend(options,{
            footerBtns: [
                LiteDialog.FOOTERBUTTONS[0]
            ],
            onOK: function () {
                alert('OK');
            }
        });
        return new LiteDialog(options).init();
    };

    LiteDialog.confirmDialog = function (options) {
        options = options || {};
        $.extend(options,{
            onOK: function () {
                alert('OK');
            },
            onCancel: function () {
                alert('Cancel');
            }
        });
        return new LiteDialog(options).init();
    };
    

    window.LiteDialog = LiteDialog;




}(window,jQuery,_));

