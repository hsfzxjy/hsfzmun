define(['util/form', 'util/rest', 'util/list', 'page-config', 'user-info'], function (_form, _rest, _list, _pageConfig, _userInfo) {
    'use strict';

    var _form2 = _interopRequireDefault(_form);

    var _rest2 = _interopRequireDefault(_rest);

    var list = _interopRequireWildcard(_list);

    var _pageConfig2 = _interopRequireDefault(_pageConfig);

    var _userInfo2 = _interopRequireDefault(_userInfo);

    function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
            return obj;
        } else {
            var newObj = {};

            if (obj != null) {
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
                }
            }

            newObj.default = obj;
            return newObj;
        }
    }

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function setReplyTo(data) {
        $('#comment-form input[name=reply_to]').remove();
        $('<input>').attr({ type: 'hidden', name: 'reply_to', value: data.id }).prependTo('#comment-form');
        $('#comment-form textarea').attr('placeholder', '@' + data.nickname);
        $('#cancel-reply').removeClass('hidden-xs-up');
        location.href = '#comment-title';
    }

    function clearReplyTo() {
        $('#comment-form input[name=reply_to]').remove();
        $('#cancel-reply').addClass('hidden-xs-up');
        $('#comment-form textarea').attr('placeholder', '');
    }

    $('#cancel-reply').click(clearReplyTo);

    var $commentBox = $("#comment-box");

    var commentAPI = new _rest2.default('/api/articles/' + _pageConfig2.default.articleId + '/comments/');

    var commentList = new list.List({
        $box: $commentBox,
        api: commentAPI,
        tmpl: 'comment-item',
        $loadMore: '#load-more-comments'
    }).results(function (results) {
        return results.forEach(function (item) {
            item.can_reply = _userInfo2.default.authenticated && item.author.id !== _userInfo2.default.userId;
        });
    });

    $commentBox.on('click', '.btn-reply', function () {
        setReplyTo($(this).data());
    });

    new _form2.default('#comment-form', commentAPI, 'post').submitted(function (response) {
        response.ok(commentList.prepend.bind(commentList)).ok(clearReplyTo);
    });

    // Verification

    $('#accept, #reject').on('click', function () {
        var _this = this;

        var action = $(this).attr('id');
        new _rest2.default('/api/articles/' + _pageConfig2.default.articleId + '/' + action + '/').post().ok(function () {
            $(_this).parent().remove();
        });
    });
});
//# sourceMappingURL=../__maps__/articles/detail.js.map
