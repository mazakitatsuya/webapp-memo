//即時関数 conflict防止
(function() {

//DOMを読み終えてから実行
$(function(){
  //ノート削除のモーダル
  $('.btn-modal').on('click', function(){
    var modal = '#' + $(this).attr('data-target');
    $(modal).addClass('open');
  });
  $('.modal').on('click', function(){
    $(this).removeClass('open');
  });
  //モーダルの中身のクリックを無効化
  $('.modal__bg').on('click', function(event){
    event.stopPropagation();
  });
  //モーダルの中身のボタンを有効化
  $('.modal__btn').on('click', function(event){
    event.preventDefault();
  });
});

})();
