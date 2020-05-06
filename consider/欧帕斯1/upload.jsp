<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
	String userId = request.getParameter("userId");
	String user_tel = request.getParameter("user_tel");
	String basePath = request.getContextPath();
%>
<!DOCTYPE html>
<html lang="en" class="z_lot">
<head>
  <meta charset="UTF-8">
  <meta content="yes" name="apple-mobile-web-app-capable">
  <meta content="yes" name="apple-touch-fullscreen">
  <meta content="telephone=no,email=no" name="format-detection">
  <!--uc强制竖屏-->
  <meta name="screen-orientation" content="portrait">
  <!--QQ强制竖屏-->
  <meta name="x5-orientation" content="portrait">
  <title></title>
  <!--<script src="http://g.tbcdn.cn/mtb/lib-flexible/0.3.4/??flexible_css.js,flexible.js"></script>-->
  <script src="js/flexible_css.js"></script>
  <script src="js/flexible.js"></script>

  <link rel="stylesheet" href="stylesheets/screen.css">
  <!-- <link rel="stylesheet" href="stylesheets/default.css"> -->
</head>
<body>
  <div class="ev_com ev_upload">
     <div class="ev_upload" style="margin:0;border:0">
       <didv class="ev_tit">为查询您的违章信息，请正确上传您的行驶证正页照</didv>
       <div class="pImg upload">
            <img src="images/lice.png" id="img_recz">
            <input type="file" accept="image/*" name="logo" id="file">
            <p class="bigp">点击上传行驶证正页照</p>
<!--             <p class="ev_error">请先上传行驶证正页照</p> -->
            <input type="button" value="提  交" class="sub" onclick="memberinfo()">
            <p class="wxt">*温馨提示，报名前请先处理违章信息*</p>

      </div>
     </div>

  </div>
  <div class="state">
    <div class="suc">
       <p>3个工作日内审核结束</p>
       <input type="button" value="确   定" class="su" onclick="javascript:window.location.href='sign.jsp?userId=<%=userId %>&user_tel=<%=user_tel %>'">
    </div>
  </div>



  <script src="js/jquery.1.8.3.min.js"></script>
  <script type="text/javascript" src="js/layer.m/layer.m.js"></script>
  <script src="dist/lrz.bundle.js"></script>

  <script>
  var drivingUrl="";
  $(function(){

    $("#img_recz").click(function(){
        $('input[name=logo]').trigger("click");
    });

    $('input[name=logo]').on('change', function(){
			 lrz(this.files[0])
				.then(function (rst) {
					$.ajax({
						url: '<%=basePath%>/v3/activity/uploadDrivingLicense',
						type: 'post',
						data: {img: rst.base64,userId:"<%=userId%>",user_tel:"<%=user_tel%>"},
						dataType: 'json',
						timeout: 200000,
						success: function (response) {
							if (response.status == '1') {
               					 $("#img_recz").attr("src",response.result.drivingUrl);
               					 drivingUrl=response.result.drivingUrl;
								return true;
							} else {
								return alert_msg(response.errorMsg);
							}
						},

						error: function (jqXHR, textStatus, errorThrown) {

							if (textStatus == 'timeout') {
								alert_msg('请求超时');

								return false;
							}

							alert_msg(jqXHR.responseText);
						}
					});

				})
				.catch(function (err) {

				})
				.always(function () {

				});
		});
  })

function alert_msg(d){
    layer.open({
        content: d,
        time: 200
    });
};

function memberinfo(){
    if(drivingUrl==null||drivingUrl==""){
        alert_msg("上传行驶证正页照");
        return false;
    }

    $.ajax({
          url:'<%=basePath%>/v3/activity/submitDrivingLicense',
          dataType: 'json',
          type:'post',
          data:{drivingUrl:drivingUrl,userId:"<%=userId%>",account:"<%=user_tel%>",channel:0},
       	dataType: 'json',
		timeout: 200000,
		success: function (response) {
			if (response.status == '1') {
				$(".state").show();
				return true;
			} else {
				return alert_msg(response.errorMsg);
			}
		},

		error: function (jqXHR, textStatus, errorThrown) {

			if (textStatus == 'timeout') {
				alert_msg('请求超时');

				return false;
			}

			alert_msg(jqXHR.responseText);
		}
	});



}
  	</script>
</body>
</html>
