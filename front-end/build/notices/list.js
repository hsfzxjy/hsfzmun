define(['notices-view-info', 'util/rest', 'timeago'], function (_noticesViewInfo, _rest) {
    'use strict';

    var _rest2 = _interopRequireDefault(_rest);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    $('a[data-id]').on('click', function (e) {
        e.preventDefault();

        var $this = $(e.currentTarget);
        var id = $this.data('id'),
            url = $this.attr('href');
        new _rest2.default('/api/notices/' + id + '/mark_as_read/').post().ok(function () {
            return location.href = url;
        });
    });

    $('#mark-as-read').on('click', function (e) {
        new _rest2.default('/api/notices/mark_all_as_read/').param('category', _noticesViewInfo.category).post().ok(function () {
            console.log('ok');
            $('.list-group-item-warning').removeClass('list-group-item-warning');
        });
    });
});
//# sourceMappingURL=../__maps__/notices/list.js.map
