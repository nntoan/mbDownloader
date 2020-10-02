/* eslint-disable no-unused-vars */
/*
 * MB (MyBook) Downloader Factory (v0.2.4)
 *
 * MB Downloader is a jQuery Widget Factory and primarily targeted to be used in userscripts.
 *
 * Copyright (c) Toan Nguyen <https://nntoan.com>
 *
 * Depends:
 *   - jQuery 1.8+                     (http://api.jquery.com/)
 *   - jQuery UI 1.11 widget factory   (http://api.jqueryui.com/jQuery.widget/)
 *   - jsZip 3.2+                      (https://github.com/Stuk/jszip)
 *   - EJs 2.6+                        (https://github.com/mde/ejs)
 *   - jEpub 2.1+                      (https://github.com/lelinhtinh/jEpub/)
 *   - FileSaver 2.0+                  (https://github.com/eligrey/FileSaver.js/)
 *
 * Widget Options:
 *   - errorAlert                      Show alert dialog if errors found
 *   - createDownloadWrapper           Create a wrapper for download button or not
 *   - insertMode                      Download btn/wrapper insert mode
 *   - credits                         ePub notes
 *   * general
 *      - host                         Hostname (default: location.host)
 *      - pathname                     Pathname (default: location.pathname)
 *      - referrer                     Full URI (default: location.protocol)
 *      - pageName                     Document title (default: document.title)
 *   * processing
 *      - ebookFileName                Ebook file name
 *      - ebookFileExt                 Ebook file extension (default: '.epub')
 *      - documentTitle                Document title when start processing
 *   * regularExp
 *      - chapter                      Chapter regexp array
 *      - novel                        Novel regexp array
 *      - chineseSpecialChars          Special chars of chinese
 *      - alphanumeric                 Alphanumeric regepx
 *      - alphabet                     Alphabetical regex
 *      - number                       Number only
 *      - buttons                      Button tags regex
 *      - eoctext                      End of each chapter string to be removed (split with '|', few start words is enough)
 *      - breakline                    Line break
 *      - chapList                     Chapter link in chap list
 *   * classNames
 *      - novelId                      The hidden ID of novel/story
 *      - infoBlock                    Identifiers of block contains all ebook info (e.g title, author)
 *      - chapterContent               Identifiers of chapter content
 *      - chapterNotContent            Identifiers of ads/non-content of each chapter
 *      - chapterVip                   The identifier of chapter required logged in
 *      - ebookTitle                   Title of the novel/story
 *      - ebookAuthor                  Author of the novel/story
 *      - ebookCover                   Cover of the book
 *      - ebookDesc                    Description of the book
 *      - ebookType                    Book tags (breadcrumbs is good to use)
 *      - downloadBtnStatus            These classnames will be removed from download button each time status updated
 *      - downloadAppendTo             Where you want to append your download button
 *      - downloadWrapper              Download wrapper intial tag
 *   * ebook
 *      - title                        ePub title
 *      - author                       ePub author
 *      - publisher                    ePub publisher
 *      - description                  ePub description
 *      - fallbackCover                ePub cover image to fallback (full image URL)
 *      - corsAnywhere                 ePub CORS anywhere service (set to blank if don't need to bypass CORS)
 *      - tags                         ePub tags (array)
 *   * chapters
 *      - chapList                     All chapters pathname of the book will be stored here
 *      - chapListSlice                Used in jQuery.slice(), [0] = Start, [1] = End
 *      - chapId                       Current chapter number
 *      - chapTitle                    Current chapter title
 *   * xhr
 *      - chapter                      This is the $.ajax() options to get chap list
 *        - type
 *        - url
 *        - data
 *      - content                      This is the $.ajax() options to get chapter content
 *        - type
 *        - url
 *        - xhrFields
  *      - cover                       This is the $.ajax() options to get book cover img
 *        - mode
 *
 * Licensed under the MIT license:
 *   https://nntoan.mit-license.org
 *
*/
(function($, undefined) {
    'use strict';

    $.widget('nntoan.mbDownloader', {
        jepub: null,
        fileSaver: null,
        processing: {
            count: 0,
            begin: '',
            end: '',
            endDownload: false,
            beginEnd: '',
            titleError: [],
            chapListSize: 0,
            retryDownload: 0,
        },
        elements: {
            $window: $(window),
            $downloadBtn: $('<a>', {
                class: 'btn blue btn-download',
                href: 'javascript:;',
                text: 'Tải xuống'
            }),
            $downloadWrapper: $('<div>'),
            $novelId: null,
            $infoBlock: null,
        },
        options: {
            errorAlert: true,
            readyToInit: false,
            isGlocCallbackRequired: false,
            createDownloadWrapper: false,
            insertMode: 'appendTo',
            credits: '<p>UserScript được viết bởi: <a href="https://nntoan.com/">Toan Nguyen</a></p>',
            general: {
                host: location.host,
                pathname: location.pathname,
                referrer: location.protocol + '//',
                pageName: document.title,
            },
            processing: {
                ebookFileName: null,
                ebookFileExt: '.epub',
                documentTitle: '[...] Vui lòng chờ trong giây lát',
            },
            regularExp: {
                chapter: /\s*Chương\s*\d+\s?:.*[^<\n]/g,
                novel: /\s*Tiểu\s*thuyết\s?:.*[^<\n]/g,
                chineseSpecialChars: /[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]+/gm, //eslint-disable-line
                alphanumeric: /\s[a-zA-Z0-9]{6,8}(="")?\s/gm,
                alphabet: /[A-Z]/,
                number: /\d+/,
                buttons: /\([^(]+<button[^/]+<\/button>[^)]*\)\s*/gi,
                eoctext: ['(ps:|hoan nghênh quảng đại bạn đọc quang lâm|Huyền ảo khoái trí ân cừu)', 'i'],
                breakline: /\n/g,
                chapList: /(?:href=")[^")]+(?=")/g,
            },
            classNames: {
                novelId: null,
                infoBlock: null,
                chapterContent: null,
                chapterNotContent: null,
                chapterVip: '#btnChapterVip',
                chapterTitle: null,
                ebookTitle: null,
                ebookAuthor: null,
                ebookCover: null,
                ebookDesc: null,
                ebookType: null,
                downloadBtnStatus: 'btn-primary btn-success btn-info btn-warning btn-danger blue success warning info danger error',
                downloadAppendTo: null,
                downloadWrapper: null,
            },
            ebook: {
                title: null,
                author: null,
                publisher: location.host,
                description: null,
                fallbackCover: null,
                corsAnywhere: 'https://cors-anywhere.herokuapp.com/',
                tags: [],
            },
            chapters: {
                chapList: [],
                chapListSlice: [6, -1],
                chapId: null,
                chapTitle: null,
            },
            xhr: {
                chapter: {
                    type: 'GET',
                    url: null,
                    data: {},
                },
                content: {
                    type: 'GET',
                    url: null,
                    xhrFields: {
                        withCredentials: true
                    }
                },
                cover: {
                    mode: 'cors'
                }
            }
        },

        _create: function () {
            // Register core elements
            this.elements.$novelId = $(this.options.classNames.novelId);
            this.elements.$infoBlock = $(this.options.classNames.infoBlock);

            if (!this.elements.$novelId.length || !this.elements.$infoBlock.length) {
                return;
            }

            // Works with options
            this.options.general.referrer = this.options.general.referrer + this.options.general.host + this.options.general.pathname;
            this.options.xhr.content.url = this.options.general.pathname + this.options.chapters.chapId + '/';

            // Prepare & register jEpub instance
            var epubInfo = this.getBookInfo();
            if (this.options.readyToInit === true) {
                this.jepub = new jEpub(); //eslint-disable-line
                this.jepub.init(epubInfo).uuid(this.options.general.referrer);
            }

            // Works with download button
            if (this.createDownloadWrapper === true) {
                this.elements.$downloadWrapper.attr('class', this.options.classNames.downloadWrapper);
                this.elements.$downloadWrapper.html(this.elements.$downloadBtn);
                this.elements.$downloadWrapper.append(this.options.classNames.downloadAppendTo);
            } else {
                this.elements.$downloadBtn.appendTo(this.options.classNames.downloadAppendTo);
            }
            this.registerEventHandlers(this.elements.$downloadBtn, 'dl');
        },

        /**
         * Retrieve/update book information.
         *
         * @returns {Object} Qualified ePub information
         */
        getBookInfo: function () {
            var epubInfo = {},
                options = this.options,
                $infoBlock = this.elements.$infoBlock;

            options.ebook = $.extend(options.ebook, {
                title: $infoBlock.find(options.classNames.ebookTitle).text().trim(),
                author: $infoBlock.find(options.classNames.ebookAuthor).find('p').text().trim(),
                cover: $infoBlock.find(options.classNames.ebookCover).find('img').attr('src'),
                description: $infoBlock.find(options.classNames.ebookDesc).html(),
            });

            var $ebookType = $infoBlock.find(options.classNames.ebookType);
            if ($ebookType.length) {
                $ebookType.each(function () {
                    options.ebook.tags.push($(this).text().trim());
                });
            }

            epubInfo = $.extend(epubInfo, options.ebook);
            this._trigger('bookInfoUpdated', null, {
                that: this,
                epubInfo: epubInfo
            });

            if (epubInfo.hasOwnProperty('cover')) delete epubInfo.cover;
            if (epubInfo.hasOwnProperty('fallbackCover')) delete epubInfo.fallbackCover;
            if (epubInfo.hasOwnProperty('corsAnywhere')) delete epubInfo.corsAnywhere;

            return epubInfo;
        },

        /**
         * Update chapter ID before get ajax content.
         *
         * Events: chapIdUpdated - params: {this}
         *
         * @param {Object} that Current JS object
         * @returns void
         */
        updateChapId: function (that) {
            var options = that.options;

            options.chapters.chapId = options.chapters.chapList[that.processing.count];
            options.xhr.content.url = options.general.pathname + options.chapters.chapId + '/';

            that._trigger('chapIdUpdated', null, that);
        },

        /**
         * Create new RegExp instance from array.
         *
         * @param {Array} regExp Regular expression array
         * @returns {RegExp}
         */
        createRegExp: function (regExp) {
            if (!regExp.length) {
                return;
            }

            return new RegExp(regExp[0], regExp[1]);
        },

        /**
         * Register all event handlers.
         *
         * @param {Element} $widget Current widget DOM element
         * @param {String} event Type of event
         * @returns void
         */
        registerEventHandlers: function ($widget, event) {
            var self = this,
                options = this.options;

            if (event === 'dl') {
                $widget.one('click contextmenu', function (e) {
                    e.preventDefault();

                    document.title = options.processing.documentTitle;
                    self.getListOfChapters(self, e, $widget);
                });
            }
        },

        /**
         * Get list of chapters request.
         *
         * @param {Object} that     Curent widget object
         * @param {Event} event     jQuery event
         * @param {Element} $widget Current node element
         * @returns void
         */
        getListOfChapters: function (that, event, $widget) {
            var options = that.options, $ajax = null;

            if (options.isGlocCallbackRequired) {
                $ajax = that._trigger('getListOfChaptersPreprocess', event, that); //$.when($.ajax(options.xhr.chapter.callback));
            } else {
                $ajax = $.ajax(options.xhr.chapter);
            }

            $ajax.done(function (response) {
                if (options.isGlocCallbackRequired) {
                    $.ajax(options.xhr.chapter).done(function(data) {
                        that.processListOfChapters(data, that, $widget);
                    }).fail(function (error) {
                        $widget.text('Lỗi trước khi bị lỗi danh mục :)');
                        that.downloadStatus('error');
                        console.error(error); //eslint-disable-line
                    });
                } else {
                    that.processListOfChapters(response, that, $widget);
                }
            }).fail(function (error) {
                $widget.text('Lỗi danh mục');
                that.downloadStatus('error');
                console.error(error); //eslint-disable-line
            });
        },

        /**
         * Process with the XHR response of chapters list.
         *
         * @param {jqXHR} response  XHR response
         * @param {Object} that     Curent widget object
         * @param {Element} $widget Current node element
         * @returns void
         */
        processListOfChapters: function (response, that, $widget) {
            var options = that.options;

            options.chapters.chapList = response.match(options.regularExp.chapList);
            options.chapters.chapList = options.chapters.chapList.map(function (val) {
                return that.chapListValueFilter(options, val);
            }).filter(function (chapter) {
                return chapter !== '';
            });

            that._trigger('chapListFiltered', null, options.chapters.chapList);
            if (event.type === 'contextmenu') {
                $widget.off('click');
                var startFrom = prompt('Nhập ID chương truyện bắt đầu tải:', options.chapters.chapList[0]);
                startFrom = options.chapters.chapList.indexOf(startFrom);
                if (startFrom !== -1) {
                    options.chapters.chapList = options.chapters.chapList.slice(startFrom);
                }
            } else {
                $widget.off('contextmenu');
            }

            that.processing.chapListSize = options.chapters.chapList.length;
            if (that.processing.chapListSize > 0) {
                that.elements.$window.on('beforeunload', function () {
                    return 'Truyện đang được tải xuống...';
                });

                $widget.one('click', function (e) {
                    e.preventDefault();
                    that.saveEbook($widget);
                });

                that.getContent($widget);
            }
        },

        /**
         * Get chapter content process.
         *
         * @param {Element} $widget Current widget DOM element
         * @returns void
         */
        getContent: function ($widget) {
            var self = this,
                options = this.options;

            if (self.processing.endDownload === true) {
                return;
            }

            this.updateChapId(self);

            $.ajax(options.xhr.content).done(function (response) {
                var $data = $(response),
                    $chapter = $data.find(options.classNames.chapterContent),
                    chapContent;

                if (self.processing.endDownload === true) {
                    return;
                }

                self.updateChapterTitle(self, $data);
                chapContent = self.parseChapterContent(self, $chapter, $widget);

                self.jepub.add(options.chapters.chapTitle, chapContent);

                if (self.processing.count === 0) {
                    self.processing.begin = options.chapters.chapTitle;
                }
                self.processing.end = options.chapters.chapTitle;

                $widget.html('Đang tải: ' + Math.floor((self.processing.count / self.processing.chapListSize) * 100) + '%');

                self.processing.count++;
                document.title = '[' + self.processing.count + '] ' + options.general.pageName;
                if (self.processing.count >= self.processing.chapListSize) {
                    self.saveEbook($widget);
                } else {
                    self.getContent($widget);
                }
            }).fail(function (error) {
                self.downloadError('Kết nối không ổn định', error);
                if (self.processing.retryDownload === 0) {
                    self.saveEbook($widget);
                }
            });
        },

        /**
         * Update chapter title.
         *
         * @param {Object} that     Current JS object
         * @param {Element} $result jQuery node for ajax response
         * @returns void
         */
        updateChapterTitle: function (that, $result) {
            var options = that.options,
                chapNum = 0;

            if (options.chapters.chapId !== '') {
                chapNum = options.chapters.chapId.match(options.regularExp.number);
                if (chapNum !== null && typeof chapNum[0] !== 'undefined') {
                    chapNum = chapNum[0];
                }
            }

            options.chapters.chapTitle = $result.find(options.classNames.chapterTitle).text().trim();
            if (options.chapters.chapTitle === '') {
                options.chapters.chapTitle = 'Chương ' + chapNum;
            }

            that._trigger('chapTitleUpdated', null, {this: that, chapNum: chapNum});
        },

        /**
         * Parse the chapter content.
         *
         * @param {Object} that         Current JS object
         * @param {Element} $chapter    Element node of chapter content
         * @param {Element} $widget     Element node of download button
         * @returns {String}
         */
        parseChapterContent: function (that, $chapter, $widget) {
            var options = that.options,
                $notContent = $chapter.find(options.classNames.chapterNotContent),
                $referrer = $chapter.find('[style]').filter(function () {
                    return (this.style.fontSize === '1px' || this.style.fontSize === '0px' || this.style.color === 'white');
                }),
                chapContent;

            if (!$chapter.length) {
                chapContent = that.downloadError('Không có nội dung');
            } else {
                if ($chapter.find(options.classNames.chapterVip).length) {
                    chapContent = that.downloadError('Chương VIP');
                } else if ($chapter.filter(function () {
                    return (this.textContent.toLowerCase().indexOf('vui lòng đăng nhập để đọc chương này') !== -1);
                }).length) {
                    chapContent = that.downloadError('Chương yêu cầu đăng nhập');
                } else {
                    var $img = $chapter.find('img');
                    if ($img.length) {
                        $img.replaceWith(function () {
                            return '<br /><a href="' + this.src + '">Click để xem ảnh</a><br />';
                        });
                    }

                    if ($notContent.length) $notContent.remove();
                    if ($referrer.length) $referrer.remove();

                    if ($chapter.text().trim() === '') {
                        chapContent = that.downloadError('Nội dung không có');
                    } else {
                        if (!$widget.hasClass('error')) {
                            that.downloadStatus('warning');
                        }
                        chapContent = that.cleanupHtml($chapter.html());
                    }
                }
            }

            return chapContent;
        },

        /**
         * Callback function to handle chap list values.
         *
         * @param {Object} options
         * @param {String} val
         * @returns {String}
         */
        chapListValueFilter: function (options, val) {
            if (typeof options.chapters.chapListSlice[1] !== 'undefined') {
                val = val.slice(options.chapters.chapListSlice[0], options.chapters.chapListSlice[1]);
            } else {
                val = val.slice(options.chapters.chapListSlice[0]);
            }
            val = val.replace(options.general.referrer, '');

            return val.trim();
        },

        /**
         * Update CSS of download button.
         *
         * @param {String} status Download status
         * @returns void
         */
        downloadStatus: function (status) {
            var self = this,
                options = this.options;

            self.elements.$downloadBtn.removeClass(options.classNames.downloadBtnStatus).addClass('btn-' + status).addClass(status);
        },

        /**
         * Handle error event of downloading process.
         *
         * @param {Boolean} error
         * @param {String} message
         * @param {Element} $widget
         * @param {Boolean} retry
         * @returns {String}
         */
        downloadError: function (error, message, $widget, retry) {
            var options = this.options;

            this.downloadStatus('error');
            if (options.errorAlert) options.errorAlert = confirm('Lỗi! ' + message + '\nBạn có muốn tiếp tục nhận cảnh báo?');
            if (error) console.error(message); //eslint-disable-line

            if (retry === true) {
                if (this.processing.retryDownload > 700) {
                    this.processing.titleError.push(options.chapters.chapTitle);
                    this.saveEbook($widget);
                    return;
                }

                this.downloadStatus('warning');
                this.processing.retryDownload += 100;
                setTimeout(function () {
                    this.getContent($widget);
                }, this.processing.retryDownload);
                return;
            }
            this.processing.titleError.push(options.chapters.chapTitle);

            return '<p class="no-indent"><a href="' + options.general.referrer + options.chapters.chapId + '">' + message + '</a></p>';
        },

        /**
         * Cleanup redundant charactes in chapter content.
         *
         * @param {String} html Chapter content as HTML
         * @returns {String}
         */
        cleanupHtml: function (html) {
            var options = this.options;

            html = html.replace(options.regularExp.chapter, '');
            html = html.replace(options.regularExp.novel, '');
            html = html.replace(options.regularExp.chineseSpecialChars, '');
            html = html.replace(options.regularExp.alphanumeric, function (key, attr) {
                if (attr) return ' ';
                if (!isNaN(key)) return key;
                if (key.split(options.regularExp.alphabet).length > 2) return ' ';
                if (key.split(options.regularExp.number).length > 1) return ' ';
                return key;
            });
            html = html.replace(options.regularExp.buttons, '');
            html = html.split(this.createRegExp(options.regularExp.eoctext))[0];
            html = html.replace(options.regularExp.breakline, '<br />');

            return '<div>' + html + '</div>';
        },

        /**
         * Save ebook process.
         *
         * @param {Element} $widget Current DOM element
         * @returns void
         */
        saveEbook: function ($widget) {
            var self = this,
                options = this.options;

            if (self.processing.endDownload) {
                return;
            }

            self.processing.endDownload = true;
            $widget.html('Đang nén EPUB...');

            if (self.processing.titleError.length) {
                self.processing.titleError = '<p class="no-indent"><strong>Các chương lỗi: </strong>' + self.processing.titleError.join(', ') + '</p>';
            } else {
                self.processing.titleError = '';
            }
            self.processing.beginEnd = '<p class="no-indent">Nội dung từ <strong>' + self.processing.begin + '</strong> đến <strong>' + self.processing.end + '</strong></p>';

            self.jepub.notes(self.processing.beginEnd + self.processing.titleError + '<br /><br />' + options.credits);

            self.finaliseEpub(self, $widget);
        },

        /**
         * Start finalising ePub file process.
         *
         * @param {Object} that      Current JS object
         * @param {Element} $widget  Current DOM element
         * @returns void
         */
        finaliseEpub: function (that, $widget) {
            var options = that.options;

            that.fetchCoverImage(options.ebook.corsAnywhere + options.ebook.cover, that);
            that.generateEpub(that, $widget);
            that._trigger('complete', null, that);
        },

        /**
         * Update cover image via fetch API.
         *
         * @param {String} coverImg
         * @param {Object} that
         */
        fetchCoverImage: function (coverImg, that) {
            var options = that.options;

            fetch(coverImg, options.xhr.cover).then(function (response) {
                if (response.ok) {
                    return response.arrayBuffer();
                }
            }).then(function (response) {
                that.jepub.cover(response);
                that._trigger('fetchCoverImage', null, { this: that, image: response });
            }).catch(function (error) {
                console.error(error); //eslint-disable-line
                coverImg = options.ebook.fallbackCover;
                that.fetchCoverImage(coverImg, that);
            });
        },

        /**
         * Create BLOB and save file to browser.
         *
         * @param {Object} that
         * @param {Element} $widget
         * @returns void
         */
        generateEpub: function (that, $widget) {
            var options = that.options,
                ebookFilepath = options.processing.ebookFileName + options.processing.ebookFileExt;

            that._trigger('beforeCreateEpub', null, that);
            that.jepub.generate().then(function (epubZipContent) {
                document.title = '[⇓] ' + options.ebook.title;
                that.elements.$window.off('beforeunload');

                $widget.attr({
                    href: window.URL.createObjectURL(epubZipContent),
                    download: ebookFilepath
                }).text('✓ Hoàn thành').off('click');
                if (!$widget.hasClass('error')) {
                    that.downloadStatus('success');
                }

                saveAs(epubZipContent, ebookFilepath); //eslint-disable-line
            }).catch(function (error) {
                that.downloadStatus('error');
                console.error(error); //eslint-disable-line
            });
        }
    });
// eslint-disable-next-line no-undef
})(jQuery);
