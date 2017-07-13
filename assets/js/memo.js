// ========== 即時関数 conflict防止 ==========
(function() {

// ========== 変数 ==========
var countList = {};
var maxNoteId = 0;
var maxDirectoryId = 0;
var directoryId = 0;
var directoryList = [];
var noteList = [];
var noteSortList = [];
var noteNum = 0;

// ========== DOMを読み終えてから実行 ==========
$(function(){

  // ========== ディレクトリリストをローカルストレージから取得 ==========
  directoryList = getLocalStorageItem('directory');
  if(directoryList !== null){
    for (var i = 0; i < directoryList.length; i++) {
      $('.list-directory__link').append('<li>' + directoryList[i].title + '</li>');
      $('.note__function__directory').append('<option value="' + directoryList[i].directoryId +'">' + directoryList[i].title + '</option>');
    }
    //初回読み込み時はすべてに着地
    $('.list-directory__link li.all').addClass('on');
  } else {
    directoryList = [];
  }

  // ========== ノートリストをローカルストレージから取得 ==========
  noteList = getLocalStorageItem('note');
  if(noteList !== null){
    //ノートリストに反映
    createDomNoteList(noteList);
    if(noteList.length !== 0){
      createDomNote(noteList, 0);
    }
  } else {
    noteList = [];
  }
  //ノートソートリストに代入して、以降の表示はこのリストを使う
  noteSortList = noteList;

  //カウントリストをローカルストレージから取得
  countList = getLocalStorageItem('count');
  if(countList !== null){
    maxNoteId = countList.maxNoteId;
    maxDirectoryId = countList.maxDirectoryId;
  } else {
    countList = {};
  }

  // ========== 新規ディレクトリを追加 ==========
  $('.modal-create-directory .modal__btn').on('click', function(){
    var directoryTitle = '';
    //maxDirIdをカウント
    maxDirectoryId++;
    directoryId = maxDirectoryId;
    countList.maxDirectoryId = directoryId;
    //ローカルストレージに保存
    saveToLs('count',countList);
    //入力タイトルの取得
    directoryTitle = $('.modal-create-directory-ttl').val();
    for (var i = 0; i < directoryList.length; i++) {
      title = directoryList[i].title;
      if(title === directoryTitle){
        showErrCreateDirectory();
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
    //ノートリストの表示
    noteSortList = setNoteSortList(directoryId);
    //ノートリストに反映
    $('.list-note__link li').remove();
    createDomNoteList(noteSortList);
    $('.list-note__link li').removeClass('on').eq(0).addClass('on');
    //ノートに内容を反映する
    if(noteSortList.length !== 0){
      showNoteDom(directoryId);
      createDomNote(noteSortList, 0);
    } else {
      hideNoteDom();
    }

    //モーダルを閉じる
    $('.modal-create-directory').removeClass('open');
    $('.modal-create-directory-ttl').val('');
  });


  // ========== ディレクトリリストの操作 ==========
  $('.list-directory__link').on('click', 'li', function(){
    var directoryTitle = '';
    var dirListNum = 0;
    dirListNum = $('.list-directory__link li').index(this);
    $('.list-directory__link li').removeClass('on').eq(dirListNum).addClass('on');
    if(dirListNum === 0){
      noteSortList = noteList;
      directoryId = 0;
    } else {
      //ディレクトリIDの取得
      directoryTitle = $('.list-directory__link li').eq(dirListNum).text();
      for (var i = 0; i < directoryList.length; i++) {
        if(directoryTitle === directoryList[i].title){
          directoryId = Number(directoryList[i].directoryId);
        }
      }
      //ディレクトリIDに紐付いたディレクトリリストを抽出
      noteSortList = setNoteSortList(directoryId);
    }
    //ノートリストに反映
    $('.list-note__link li').remove();
    createDomNoteList(noteSortList);
    $('.list-note__link li').removeClass('on').eq(0).addClass('on');
    //検索の文字列を空にする
    $('.list-note__function__search').val('');
    //ノートに内容を反映する
    if(noteSortList.length !== 0){
      showNoteDom(directoryId);
      createDomNote(noteSortList, 0);
    } else {
      hideNoteDom();
    }
  });

  // ========== 新規ノートを追加 ==========
  $('.btn-create-note').on('click', function(event){
    event.preventDefault();
    showNoteDom(directoryId);
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
    createDomFirstReadNoteList(date, title);
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
      createDomNote(noteSortList, noteNum);
    } else {
      createDomNote(noteList, noteNum);
    }
  });

  // ========== ノートリスト内から検索 ==========
  $('.list-note__function__search').on('change keyup', function(){
    var keyword = $('.list-note__function__search').val();
    var searchResultList = $.grep(noteSortList,function(elem, index){
      return(elem.title.match(keyword) || elem.contents.match(keyword));
    });
    searchResultList;
    //ノートリストに反映
    $('.list-note__link li').remove();
    createDomNoteList(searchResultList);
    $('.list-note__link li').removeClass('on').eq(0).addClass('on');
    //ノートを反映
    if(noteSortList.length !== 0){
      showNoteDom(directoryId);
      createDomNote(noteSortList, 0);
    } else {
      hideNoteDom(directoryId);
    }
  });

  // ========== ノートのタイトル/内容の更新 ==========
  $('.note__contents__heading,.note__contents__body').on('change keyup',function(){
    //enterを押した後に表示の切り替え
    var title = $('.note__contents__heading').val();
    var contents = $('.note__contents__body').val();
    var dateObj = new Date;
    var date = checkDate(dateObj);
    //ノートオブジェクトを更新
    var noteObj = noteList[noteNum];
    noteObj.title = title;
    noteObj.contents = contents;
    noteObj.date = date;
    //編集したノートオブジェクトを配列の先頭に持ってくる
    var tmp = noteList.splice(noteNum, 1)[0];
    noteList.unshift(tmp);
    //更新した配列をノートリストに反映
    createDomNoteListReload(noteNum, date, title);
    $('.list-note__link li').removeClass('on').eq(0).addClass('on');
    noteNum = 0;
    //ローカルストレージに保存
    saveToLs('note',noteList);
  });

  // ========== ノートのフォルダ紐付けの更新 ==========
  $('.note__function__directory').on('change', function() {
    directoryId = Number($('.note__function__directory').val());
    var dateObj = new Date;
    var date = checkDate(dateObj);

    //ノートオブジェクトを更新
    var noteObj = noteList[noteNum];
    noteObj.date = date;
    noteObj.directoryId = directoryId;
    //編集したノートオブジェクトを配列の先頭に持ってくる
    var tmp = noteList.splice(noteNum, 1)[0];
    noteList.unshift(tmp);
    //ノートリストの表示
    noteSortList = setNoteSortList(directoryId);
    //ノートリストに反映
    $('.list-note__link li').remove();
    createDomNoteList(noteSortList);
    $('.list-note__link li').removeClass('on').eq(0).addClass('on');
    noteNum = 0;
    //ノートに内容を反映する
    if(noteSortList.length !== 0){
      showNoteDom(directoryId);
      createDomNote(noteSortList, 0);
    } else {
      hideNoteDom();
    }
    //ディレクトリの現在地を変更
    for (var i = 0; i < directoryList.length; i++) {
      if(directoryList[i].directoryId === directoryId){
        arrayNum = i;
      }
    }
    var dirListNum = arrayNum + 1;
    $('.list-directory__link li').removeClass('on').eq(dirListNum).addClass('on');
  });

  // ========== ノートの削除 ==========
  $('.modal-delete-note .modal__btn').on('click', function(){
    noteSortList = setNoteSortList(directoryId);
    var noteObj = noteSortList[noteNum];
    var index = noteList.indexOf(noteObj);
    noteList.splice(index,1);
    //ノートの削除
    deleteDomNote(noteNum);
    //ローカルストレージに保存
    saveToLs('note',noteList);
    //モーダルを閉じる
    $('.modal-delete-note').removeClass('open');
  });

});


// ========== ディレクトリのDOM操作関連 ==========



// ========== ノートリストDOM操作関連 ==========
//ノートリスト読み込み追加
function createDomNoteList(listName){
  for (var i = 0; i < listName.length; i++) {
    var noteObj = listName[i];
    var title = noteObj.title;
    var date = noteObj.date;
    if(title === ''){
      $('.list-note__link').append('<li><time>' + date + '</time>' + '無題' + '</li>');
    } else {
      $('.list-note__link').append('<li><time>' + date + '</time>' + title + '</li>');
    }
  }
}
//ノートリストの先頭に追加
function createDomFirstReadNoteList(date, title) {
  //別の書き方１
  if(title === ''){
    title = '無題';
  }
  //別の書き方２
  //title = title ? title : '無題';

  $('.list-note__link').prepend('<li><time>' + date + '</time>' +  title + '</li>');
  // if(title === ''){
  //   $('.list-note__link').prepend('<li><time>' + date + '</time>' + '無題' + '</li>');
  // } else {
  //   $('.list-note__link').prepend('<li><time>' + date + '</time>' + title + '</li>');
  // }
}
// ========== ノートリストArray操作関連 ==========
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
//

//更新した配列をノートリストに反映
function createDomNoteListReload(noteNum, date, title){
  var target = $('.list-note__link li').eq(noteNum);
  if(title === ''){
    $(target).html('<time>' + date + '</time>' + '無題');
  } else {
    $(target).html('<time>' + date + '</time>' + title);
  }
  $(target).prependTo('.list-note__link');
}
// ========== ノートDOM操作関連 ==========
//ノートの表示をセットする
function createDomNote(listName, listNum){
  $('.list-note__link li').removeClass('on').eq(listNum).addClass('on');
  $('.note__contents__heading').val(listName[listNum].title);
  $('.note__contents__body').val(listName[listNum].contents);
  $('.note__function__directory').val(listName[listNum].directoryId);
}
//ノートを削除する
function deleteDomNote(noteNum){
  $('.note__contents__heading').val('');
  $('.note__contents__body').val('');
  $('.list-note__link li').eq(noteNum).remove();
  noteList.splice(noteNum, 1);
}
//ノートを隠す
function hideNoteDom() {
  $('.note__contents__heading').css('visibility','hidden');
  $('.note__contents__body').css('visibility','hidden');
  $('.note__function__directory').val(directoryId).css('visibility','hidden');
}
//隠したノートを表示する
function showNoteDom(directoryId){
  $('.note__contents__heading').css('visibility','visible');
  $('.note__contents__body').css('visibility','visible');
  $('.note__function__directory').val(directoryId).css('visibility','visible');
}

// ========== モーダルウィンドウのDOM操作関連 ==========
function showErrCreateDirectory(){
  $('.modal__error').addClass('open');
  $('.modal__btn').prop('disabled', true);
  $('.modal-create-directory-ttl').val('');
  $('.modal__btn').prop('disabled', false);
}

// ========== 保存関連 ==========
//ローカルストレージから呼び出す
function getLocalStorageItem(key){
  var item = window.localStorage.getItem(key);
  return item !== null ? JSON.parse(item) : null;
}
//ローカルストレージに保存
function saveToLs(key, value){
  var noteListStr = JSON.stringify(value);
  window.localStorage.setItem(key, noteListStr);
}

// ========== 日時操作関連 ==========
//現在時間をチェックする
function checkDate(dateObj){
  var year = dateObj.getFullYear();
  var month = dateObj.getMonth()+1;
  var day = dateObj.getDate();
  var hours = dateObj.getHours();
  var minutes = dateObj.getMinutes();
  var date = year + '年' + month + '月' + day + '日' + hours + ':' + minutes;
  return date;
}

})();
