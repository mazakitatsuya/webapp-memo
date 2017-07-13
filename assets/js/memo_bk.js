// ========== 即時関数 conflict防止 ==========
(function() {

// ========== 変数 ==========
var countList = {};
var maxNoteId = 0;
var maxDirectoryId = 0;
var directoryId = 0;
var directoryList = [];
var noteSortList = [];
var directoryNum = 0;
var noteList = [];
var noteNum = 0;

// ========== DOMを読み終えてから実行 ==========
$(function(){

  // ========== ディレクトリリストをローカルストレージから取得 ==========
  //var directoryListStr = window.localStorage.getItem('directory');
  var directoryList = getLocalStorageItem('directory');
  if(directoryList !== null){
    // directoryList = JSON.parse(directoryListStr);
    for (var i = 0; i < directoryList.length; i++) {
      var directory = directoryList[i];
      $('.list-directory__link').append('<li>' + directory.title + '</li>');
      $('.note__function__directory').append('<option value="' + directory.directoryId +'">' + directory.title + '</option>');
    }
    //初回読み込み時はすべてディレクトリに着地
    $('.list-directory__link li.all').addClass('on');
  }


  // ========== ノートリストをローカルストレージから取得 ==========
  var noteList = getLocalStorageItem('note');
  if(noteList !== null){
    //ノートソートリストにも読み込み時のノートリストを持たせる
    noteSortList = noteList;
    //ノートリストエリアにノートソートリストを表示する
    for (var i = 0; i < noteList.length; i++) {
      var noteObj = noteList[i];
      var title = noteObj.title;
      var date = noteObj.date;
      setNoteList(date, title);
      // var contents = noteObj.contents;
      // directoryId = noteObj.directoryId;
      // var noteId = noteObj.noteId;
    }
    if(noteList.length !== 0){
      setNote(noteList, 0);
    }
    // directoryId = 0;
  }
  //カウントリストをローカルストレージから取得
  var countList = getLocalStorageItem('count');
  if(countList !== null){
    maxNoteId = countList.maxNoteId;
    maxDirectoryId = countList.maxDirectoryId;
  }


  // ========== 新規ディレクトリを追加 ==========
  $('.modal-create-directory .modal__btn').on('click', function(){
    //maxDirIdをカウント
    maxDirectoryId++;
    directoryId = maxDirectoryId;
    countList.maxDirectoryId = directoryId;
    //ローカルストレージに保存
    saveToLs('count',countList);
    //入力タイトルの取得＆入力チェック
    var directoryTitle = $('.modal-create-directory-ttl').val();
    for (var i = 0; i < directoryList.length; i++) {
      var title = directoryList[i].title;
      if(title === directoryTitle){
        $('.modal__error').addClass('open');
        $('.modal__btn').prop('disabled', true);
        $('.modal-create-directory-ttl').val('');
        $('.modal__btn').prop('disabled', false);
        return;
      }
    }
    //エラー文言の削除
    $('.modal__error').remove();
    //ディレクトリリストに反映
    $('.list-directory__link li.all').after('<li>' + directoryTitle + '</li>');
    $('.list-directory__link li').removeClass('on').eq(1).addClass('on');
    //ノートのディレクトリ指定セレクトボックスに反映
    $('.note__function__directory').prepend('<option value="' + directoryId +'">' + directoryTitle + '</option>');
    //ディレクトリオブジェクトに格納
    var directory = {
      title: directoryTitle,
      directoryId: directoryId
    };
    //ディレクトリリストに追加
    directoryList.unshift(directory);
    //ローカルストレージに保存
    saveToLs('directory',directoryList);
    //モーダルを閉じる
    $('.modal-create-directory').removeClass('open');
    $('.modal-create-directory-ttl').val('');
  });


  // ========== ディレクトリリストの操作 ==========
  $('.list-directory__link').on('click', 'li', function(){
    directoryId = 0;
    var directoryTitle = '';
    var title = '';
    var date = '';

    directoryNum = $('.list-directory__link li').index(this);
    $('.list-directory__link li').removeClass('on').eq(directoryNum).addClass('on');
    //ディレクトリIDの取得
    directoryTitle = $('.list-directory__link li').eq(directoryNum).text();
    for (var i = 0; i < directoryList.length; i++) {
      if(directoryTitle === directoryList[i].title){
        directoryId = Number(directoryList[i].directoryId);
      }
    }
    //ディレクトリIDに紐付いたディレクトリリストを抽出
    noteSortList = setNoteSortList(directoryId);

    //ノートリストに反映
    $('.list-note__link li').remove();
    for (var i = 0; i < noteSortList.length; i++) {
      title = noteSortList[i].title;
      date = noteSortList[i].date;
      setNoteList(date, title);
      $('.list-note__link li').removeClass('on').eq(0).addClass('on');
    }
    //ノートを反映
    if(noteSortList.length !== 0){
      $('.note__contents__heading').css('visibility','visible');
      $('.note__contents__body').css('visibility','visible');
      $('.note__function__directory').css('visibility','visible');
      setNote(noteSortList, 0);
    } else {
      $('.note__contents__heading').css('visibility','hidden');
      $('.note__contents__body').css('visibility','hidden');
      $('.note__function__directory').val(directoryId).css('visibility','hidden');
    }
  });


  // ========== 新規ノートを追加 ==========
  $('.btn-create-note').on('click', function(event){
    event.preventDefault();
    $('.note__contents__heading').css('visibility','visible');
    $('.note__contents__body').css('visibility','visible');
    $('.note__function__directory').val(directoryId).css('visibility','visible');
    noteNum = 0;
    var title = '';
    var contents = '';
    var dateObj = new Date;
    var date = checkDate(dateObj);
    var noteId = 0;
    if(directoryId){
      directoryId;
    } else {
      directoryId = 0;
    }
    //maxNoteIdをカウント
    maxNoteId++;
    countList.maxNoteId = maxNoteId;
    noteId = maxNoteId;
    //ローカルストレージに保存
    saveToLs('count',countList);
    //ノートオブジェクトに格納
    var noteObj = {
      title: title,
      contents: contents,
      date: date,
      noteId: noteId,
      directoryId: directoryId
    };
    //ノートリストに追加
    noteList.unshift(noteObj);
    //ローカルストレージに保存
    saveToLs('note',noteList);
    //ノートリストに反映
    addNoteList(date, title);
    $('.list-note__link li').removeClass('on').eq(0).addClass('on');
    //ノートに反映
    $('.note__contents__heading').val(title);
    $('.note__contents__body').val(contents);
  });

  // ========== ノートリストの操作 ==========
  $('.list-note__link').on('click', 'li', function(){
    noteNum = $('.list-note__link li').index(this);
    $('.list-note__link li').removeClass('on').eq(noteNum).addClass('on');
    if(noteSortList !== null){
      setNote(noteSortList, noteNum);
    } else {
      setNote(noteList, noteNum);
    }
  });

  // ========== ノートリスト内から検索 ==========
  $('.list-note__function__search').on('change', function(){
    var keyword = $('.list-note__function__search').val();
  });

  // ========== ノートの更新 ==========
  $('.note__contents__heading,.note__contents__body,.note__function__directory').on('change',function(e){
    //enterを押した後に表示の切り替え
    var title = $('.note__contents__heading').val();
    var contents = $('.note__contents__body').val();
    directoryId = Number($('.note__function__directory').val());
    var dateObj = new Date;
    var date = checkDate(dateObj);
    //ノートオブジェクトを更新
    var noteObj = noteList[noteNum];
    noteObj.title = title;
    noteObj.contents = contents;
    noteObj.date = date;
    noteObj.directoryId = directoryId;
    //編集したノートオブジェクトを配列の先頭に持ってくる
    var tmp = noteList.splice(noteNum, 1)[0];
    noteList.unshift(tmp);
    //更新した配列をノートリストに反映
    var target = $('.list-note__link li').eq(noteNum);
    if(title === ''){
      $(target).html('<time>' + date + '</time>' + '無題');
    } else {
      $(target).html('<time>' + date + '</time>' + title);
    }
    $(target).prependTo('.list-note__link');
    $('.list-note__link li').removeClass('on').eq(0).addClass('on');
    noteNum = 0;
    //ローカルストレージに保存
    saveToLs('note',noteList);
  });

  // ========== ノートの削除 ==========
  $('.modal-delete-note .modal__btn').on('click', function(){
    noteSortList = setNoteSortList(directoryId);
    var noteObj = noteSortList[noteNum];
    var index = noteList.indexOf(noteObj);
    noteList.splice(index,1);
    //ノートの削除
    deleteNote(noteNum);
    //ローカルストレージに保存
    saveToLs('note',noteList);
    //モーダルを閉じる
    $('.modal-delete-note').removeClass('open');
  });

});









// ========== ディレクトリ操作関連 ==========



// ========== ノートリスト操作関連 ==========
//ノートリスト読み込み追加
function setNoteList(date, title){
  if(title === ''){
    $('.list-note__link').append('<li><time>' + date + '</time>' + '無題' + '</li>');
  } else {
    $('.list-note__link').append('<li><time>' + date + '</time>' + title + '</li>');
  }
}
//ディレクトリIDからノートソートリストをセットする
function setNoteSortList(directoryId){
  if(directoryId === 0){
    var filtered = noteList;
  } else {
    var filtered = $.grep(noteList,function(elem, index){
      return(Number(elem.directoryId) === directoryId);
    });
  }
  return filtered;
}

// ========== ノート操作関連 ==========
//ノートリストの先頭に追加
function addNoteList(date, title) {
  if(title === ''){
    $('.list-note__link').prepend('<li><time>' + date + '</time>' + '無題' + '</li>');
  } else {
    $('.list-note__link').prepend('<li><time>' + date + '</time>' + title + '</li>');
  }
}
//ノートの表示をセットする
function setNote(listName, listNum){
  $('.list-note__link li').removeClass('on').eq(listNum).addClass('on');
  $('.note__contents__heading').val(listName[listNum].title);
  $('.note__contents__body').val(listName[listNum].contents);
  $('.note__function__directory').val(listName[listNum].directoryId);
}
//ノートを削除する
function deleteNote(noteNum){
  $('.note__contents__heading').val('');
  $('.note__contents__body').val('');
  $('.list-note__link li').eq(noteNum).remove();
  noteList.splice(noteNum, 1);
}


// ========== ローカルストレージ関連 ==========
//ローカルストレージから呼び出す
function getLocalStorageItem(key){
  var item = window.localStorage.getItem(key);
  return item !== null ? JSON.parse(item) : null;
}
//ローカルストレージに保存する
function saveToLs(key, value){
  var item = JSON.stringify(value);
  window.localStorage.setItem(key, item);
}


// ========== 日時操作関連 ==========
//現在時間をチェックする
function checkDate(dateObj){
  var year = dateObj.getFullYear();
  var month = dateObj.getMonth()+1;
  var day = dateObj.getDate();
  var hours = dateObj.getHours();
  var minutes = dateObj.getMinutes();
  var seconds = dateObj.getSeconds();
  var date = year + '年' + month + '月' + day + '日' + hours + ':' + minutes+ ':' + seconds;
  return date;
}

})();
