import 'file-upload'
import API from 'util/rest'
import * as tmpl from 'util/tmpl'
import * as timeago from 'timeago'

// `ProxyFile` Class Definition

function ProxyFile ({ uploader, data = null, fileObject = null }) {
    this._uploader = uploader
    this._fileObject = fileObject
    this._data = data

    this._init()
}

ProxyFile.prototype = {

    _init () {
        this._uploading = !!this._fileObject
        this._uploader.add(this)
        if (this._uploading) this._fileObject.proxyFile = this

        this._render()
        this._setData()
    },

    _render () {
        this._$el = tmpl.renderBefore(
            this._uploader._$fileBox,
            this._uploader._tmpl,
            this._fileObject || this._data
        )

        this._$el.find('.file-cancel').click(this._destroy.bind(this))
    },

    _setData (data = null) {
        if (data) {
            this._data = data
            this._uploading = false
        }
        if (!this._$el || !this._data) return

        this._$el.find('.timeago').attr('datetime', this._data.created)
        timeago.bind()

        this._$formInput = $(`<input type="hidden" />`)
            .attr('name', 'attachments[]').attr('value', this._data.id)
            .appendTo(this._uploader._$form)
    },

    _destroy () {
        if (this._uploading) {
            this._fileObject.abort()
            this._uploader.remove(this)
        } else {
            new API(`/api/attachments/${this._data.id}/`).delete()
                .ok(() => {
                    this._$formInput.remove()
                    this._uploader.remove(this)
                })
        }
        this._$el.remove()
    }
}



// `Upload` Class Definition

export function Upload ({ $button, $noFiles = null, $form, $progress, initialAPI, $fileBox, tmpl }) {
    this._$button = $($button)
    this._$noFiles = $($noFiles)
    this._$form = $($form)
    this._$progress = $($progress)
    this._initialAPI = initialAPI
    this._$fileBox = $($fileBox)
    this._proxyFiles = []
    this._tmpl = tmpl

    this._init()
}

Upload.prototype = {

    _init () {
        this._loadInitial()

        this._$button.find('input[type=file]').fileupload({
            url: '/api/attachments/',
            dataType: 'json',
            maxFileSize: 10000000
        })
        .on('fileuploadadd', (e, data) => {
            this._setButtonState(true)

            let file = data.files[0]
            file.abort = () => data.abort()

            new ProxyFile({
                uploader: this,
                fileObject: file
            })
        })
        .on('fileuploaddone', (e, { result, files: [fileObject] }) => this._uploaded(fileObject, result))
        .on('fileuploadprogressall', (e, { loaded, total }) => this._progress(parseInt(loaded / total * 100, 10)))
        .on('fileuploadalways', () => {
            this._setProgress(0)
            this._setButtonState(false)
        })
    },

    _setButtonState (value) {
        setTimeout(() => {
            this._$button.toggleClass('disabled', value).find('input').prop('disabled', value)
        }, 100)
    },

    _loadInitial () {
        if (!this._initialAPI) return
        new API(this._initialAPI).get().ok(data => {
            data.forEach(item => new ProxyFile({
                uploader: this,
                data: item
            }))
        })
    },

    _setNoFiles () {
        if (!this._$noFiles.length) return

        let state = !this._proxyFiles.length

        this._$noFiles[state ? 'show': 'hide']()
    },

    _uploaded (fileObject, data) {
        fileObject.proxyFile._setData(data)
    },

    _progress (percent) {
        this._setProgress(percent)
    },

    _setProgress (percent) {
        this._$progress.css('width', `${percent}%`)
    },

    add (proxyFile) {
        this._proxyFiles.push(proxyFile)
        this._setNoFiles()
    },

    remove (proxyFile) {
        let index = this._proxyFiles.indexOf(proxyFile)
        if (index < 0) return
        this._proxyFiles.splice(index, 1)
        this._setNoFiles()
    }
}
