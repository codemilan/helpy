/*jshint multistr: true */

var Helpy = Helpy || {};

Helpy.ready = function(){

  $('.profile').initial();

  $('.attachinary-input').attachinary();

  $('.uploader').fileupload({
    dataType: 'script',
    singleFileUploads: false
  });

  $('.screenshot-link').magnificPopup({type:'image', gallery:{enabled:true}});

  // make sure dropdowns close after click of link
  $(".dropdown-menu a").click(function() {
    $(this).closest(".dropdown-menu").prev().dropdown("toggle");
  });

  $('.navbar-form, #search-form').off().on('submit', function(){
    $('.navbar-collapse.in').collapse('hide');
  });

  $('.thumbnail, .stats').off();

  // jquery hhoks for the home page
  $('.topic-box').click(function(){
    document.location.href = $(this).data("link");
  });

  $('.thumbnail, .stats').on('mouseover',function(){
    $(this).css('cursor','pointer');
    $(this).css('border','1px solid #666');
    $(this).css('box-shadow', '0px 0px 10px #eee');
    $(this).closest('.has-arrow').addClass('over');
  });

  $.ui.autocomplete.prototype._renderItem = function( ul, item) {
    return $( "<li></li>" )
        .data( "item.autocomplete", item.name )
        .append( "<div class='ui-menu-item-heading'><a href=" + item.link + " >" + item.name + "</a></div>" )
        .append( "<div class='ui-menu-item-content' >" + item.content + "</div>" )
        .appendTo( ul );
  };


  $(".autosearch").keyup(function () {
      var that = $(this);
      value = $(this).val();
      $(this).autocomplete({
        source: function (request, response) {
          jQuery.get("/"+location.href.split("/")[3]+"/search.json", {
              query: value
          }, function (data) {
            response(data);
          });
        },
        minLength: 3,
        appendTo: that.next(),
        focus: function( event, ui ) {
          $(".autosearch").val(ui.item.name);
        },
        select: function( event, ui ) {
          window.location.href = ui.item.link;
        },
        messages: {
          noResults: '',
          results: function() {}
        }

      });

  });

  $("#topic_name").blur(function () {
      var that = $(this);
      var $results = $('.suggestion-results');
      var $container = $('.suggestion-results-container');
      $query = $(this).val();

      if ($query.length >= 3) {
        $.getJSON( "/"+location.href.split("/")[3]+"/search.json?depth=5&query=" + $query, function( data ) {
          var items = [];
          $.each( data, function( key, val ) {
            items.push( "<li id='" + key + "'><a href='" + val.link + "' target='blank'>" + val.name + "</a></li>" );
          });

          var $html = $( "<ul/>", {
          "class": "suggested-results list-unstyled",
          html: items.join( "" )}
          );

          if (items.length > 0) {
            $results.html($html);
            $container.removeClass("hidden");
            $container.fadeIn();
          }
        });
      }
  });

  $('.stats').on('click', function(){


    $('.stats').css('border','1px solid #ddd');
    $('.stats').css('box-shadow', '');
    $('.has-arrow').removeClass("over");
    $('.stats').removeClass("selected");

    $(this).addClass('selected');
    $(this).css('border','1px solid #666');
    $(this).css('box-shadow', '0px 0px 10px #eee');
    $(this).closest('.has-arrow').addClass('over');

    var form = $("<form></form>");
    var url = $(this).find('a').attr('href');
    form.attr(
    {
        id     : "formform",
        // The location given in the link itself
        action : $(this).find('a').attr('href'),
        method : "GET",
        "data-remote" : "true"
    });

    $("body").append(form);
    $("#formform").submit();
    $("#formform").remove();

    // Ensure history is captured in the browser
    history.pushState(null, '', url);
    $(window).off().on("popstate", function(){
      console.log("Popstate fired: " + location.href);
      $.getScript(location.href);
    });

    // Prevent the link from opening normally
    return false;
  });

  $('.thumbnail, .stats').on('mouseout',function(){
    if ($(this).hasClass('selected') !== true) {
      $(this).css('cursor','auto');
      $(this).css('border','1px solid #ddd');
      $(this).css('box-shadow', '');
      $(this).closest('.has-arrow').removeClass('over');
    }
  });

  // Sets up autoscroll for any link with class autoscroll
  // requires data-target param containing class or ID of target
  $(".autoscroll").each(function(){
      $(this).click(function(){
        var scrollTarget=$(this).data("target");
        $('html,body').animate({
          scrollTop: $(scrollTarget).offset().top},'slow');
        });
  });

  // used by create topic form
  $('#topic_private_true').click(function(){
    $("#topic_forum_id").parent().hide();
    $('#new_topic').append("<input type='hidden' id='new_topic_forum_id' name='topic[forum_id]' value='1'/>");
    Helpy.showGroup();
  });
  $('#topic_private_false').click(function(){
    $("#topic_forum_id").parent().show();
    $("#new_topic_forum_id").remove();
    Helpy.showGroup();
  });


  // Hide/replace last child of breadcrumbs since I don't have time to hack gem right now
  $("ul.breadcrumb li:last-child").html("");

  // compress thread if there are more than 4 messages
  var $thread = $('.post-container.kind-reply.disallow-post-voting, .post-container.kind-note.disallow-post-voting');
  if ($thread.size() >= 2) {

    // insert expand thread message
//    var $hider = "<div class='collapsed-posts text-center'><span class='label label-collapsed'>" + ($thread.size()-1) + " collapsed messages </span></div>";
    var $hider = "<div class='collapsed-posts text-center'><span class='label label-collapsed'>" + Helpy.messages + " </span></div>";

    // check to see if we are already collapsed
    if ($(".collapsed-posts").size() === 0) {
      $(".kind-first").append($hider);
    }

    // add listener to expand messages
    $('.collapsed-posts').on('click', function(){
      $thread.show();
      $('.collapsed-posts').hide();
    });

    // hide thread, except for most recent message
    $thread.hide().last().show();
  }

  // Use or append common reply
  $('#post_reply_id').on('change', function(){
    var post_body = $('#post_body');
    var common_reply = $('#post_reply_id option:selected');

    // append new line if some text already exists
    if( post_body.val() && common_reply.val() ) {
      post_body.val(post_body.val() + "\n\n");
    }

    // add content of selected reply
    post_body.val( post_body.val() + common_reply.val() );
    $('.disableable').attr('disabled', false);
  });

  $('.post-menu span').off().on('click', function(){
    $(this).closest('.post-container').css('z-index','99999');
  });

  function updateMessage(){
    var output;
    var messages = $('.topic-checkbox:checked').size();

    switch(messages) {
      case 1:
        output = Helpy.selected[1];
        break;
      case 2:
        output = Helpy.selected[2];
        break;
      default:
        output = Helpy.selected[3].replace("9", messages);
        break;
    }
    $('.selected-message').text(output);
  }

  $('#check-all').off().on('change', function(){
    if (this.checked) {
      $('.topic-checkbox').prop('checked', true);
      $('#multiple-edit').fadeIn();
      updateMessage();

    } else {
      $('.topic-checkbox').prop('checked', false);
      $('#multiple-edit').fadeOut();
    }
  });

  $('.topic-checkbox').off().on('change', function(){

    if (this.checked) {
      $('#multiple-edit').fadeIn();
      updateMessage();

    } else {
      if ($('.topic-checkbox:checked').size() === 0) {
        $('#multiple-edit').fadeOut();
      } else {
        updateMessage();
      }
    }
  });

  $('.multiple-update').off().on('click', function(){
    // collect array of all checked boxes
    var topic_ids = {};
    var str = $(this).attr('href');
    $('.topic-checkbox:checked').each(function(i){
      topic_ids[i] = $(this).val();
    });
    // modify link to include array
    $.each(topic_ids, function(i){
      str = str + "&topic_ids[]=" + topic_ids[i];
    });
    $(this).attr('href', str);
    // return true to follow the link
    return true;
  });

  // Topic voting widget animation
  $('.topic-points').hover(function(){
    $(this).addClass('animated pulse');
    $(this).prev().addClass('animated bounce');
  }, function(){
    $(this).removeClass('animated pulse');
    $(this).prev().removeClass('animated bounce');
  });

  // Locale Picker
  $('#lang').off().on('change', function() {
    var url = $("#lang").val();
    if(url !=="")
     {
     $("#locale-change").submit();
     }
  });

  // Login/Forgot Switcher

  $('.login-link').off().on('click', function() {
    $('.login-form').show();
    $('.forgot-form').hide();
    $('.modal-title').text($('.login-form').data("title"));
    $('.modal-links').show();
  });

  $('.forgot-link').off().on('click', function() {
    $('.login-form').hide();
    $('.forgot-form').show();
    $(ClientSideValidations.selectors.forms).validate();
    $('.modal-title').text($('.forgot-form').data("title"));
    $('.modal-links').hide();
  });

  // Disable submit button if post not provided
  $('.disable-empty').keyup(function(){
    $('.disable-empty').each(function(){
      if ($(this).val() === '') {
        $('.disableable').attr('disabled', 'disabled');
      } else {
        $('.disableable').removeAttr('disabled');
      }
    });
  });

  // Autolink messages
  $('.post-body').each(function(){
    var that = $(this);
    var text = that.html();

    that.html(text.autoLink({ target: "_blank" }));
  });

  // Post CC and BCC
  $('.cc-bcc-toggle').off().on('click', function() {
    $fieldContainer = $('.cc-bcc');

    if ($fieldContainer.hasClass('hidden')){
      $fieldContainer.removeClass('hidden');
      var previousCC = $('.post-cc').last().text().split(": ")[1];
      var previousBCC = $('.post-bcc').last().text().split(": ")[1];
      $('#post_cc').val(previousCC);
      $('#post_bcc').val(previousBCC);
      $('.cc-bcc-toggle').addClass('fa-angle-up').removeClass('fa-angle-down');
    } else {
      $fieldContainer.addClass('hidden');
      $('#post_cc').val("");
      $('#post_bcc').val("");
      $('.cc-bcc-toggle').removeClass('fa-angle-up').addClass('fa-angle-down');
    }
  });

  // Hide required field indicator generated by simple_form, as we already
  // Add this in css.  There is probably a better way to do this?
  $("abbr[title='required']").hide();

};

$.attachinary.config.template = '\
  <ul class="list-inline attachinary-thumbnails">\
    <% for(var i=0; i<files.length; i++){ %>\
      <li>\
        <% if(files[i].resource_type == "raw") { %>\
          <div class="raw-file"></div>\
        <% } else { %>\
          <img\
            src="<%= $.cloudinary.url(files[i].public_id, { "version": files[i].version, "format": "jpg", "crop": "fill", "width": 250, "height": 250 }) %>"\
            alt="" width="75" height="75" />\
        <% } %>\
        <br/>\
        <a href="#" data-remove="<%= files[i].public_id %>">Remove</a>\
      </li>\
    <% } %>\
  </ul>\
';


// This is included here because you would expect to find it here.  The function is actually called
// from event-tracking.js where we have to unbind and rebind the event to support turbolinks
Helpy.didthisHelp = function(yesno){
  var message;
  var contactus;
  if (yesno === "no") {
    message = "<h3>" + Helpy.noHelped + "</h3>";
    contactus = "<div class='col-md-3 align-right'><h3>" + Helpy.contactUs + "</h3></div>";
  } else {
    message = "<h3>" + Helpy.yesHelped + "</h3>";
    contactus = '';
  }

  message = "<div class='col-md-9'>" + message + "</div>" + contactus;

  $('#did-this-help').html(message);
  return true;
};

Helpy.showGroup = function() {
  if ($('#topic_private_true').is(':checked')) {
    $('#topic_team_list').parent().removeClass('hidden');
  } else if ($('#topic_private_false').is(':checked')) {
    $('#topic_team_list').parent().addClass('hidden');
  } else {
    $('#topic_team_list').parent().removeClass('hidden');
  }
};

$(document).ready(Helpy.ready);
$(document).on('page:load', Helpy.ready);

$(document).on('page:change', function () {

  //Truncate Q&A responses
  $('.shorten').jTruncate({
    length: 200,
    minTrail: 0,
    moreText: " (more)",
    lessText: " (less)",
    ellipsisText: " ...",
    moreAni: "",
    lessAni: ""
  });

  // Allows image insertion into quill editor
  $('.doc-form-files .cloudinary-fileupload').bind('cloudinarydone', function(e, data) {
    var element = document.querySelector("trix-editor");
    var thisImage = "<img src='" + $.cloudinary.image(data.result.public_id).attr('src') + "'>";
    element.editor.insertHTML(thisImage);

    $('.image_public_id').val(data.result.public_id);
    return true;
  });

});
