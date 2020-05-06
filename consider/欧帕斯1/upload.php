<?php

$base64_image_content = $_POST['img'];

if (preg_match('/^(data:\s*image\/(\w+);base64,)/', $base64_image_content, $result)){
    $type = $result[2]; //jpeg
    $img = base64_decode(str_replace($result[1], '', $base64_image_content)); //返回文件流
}

//var_dump($_POST); //string(1507) "data:image/jpeg;base64,/9j/4AAQSkZJR...
//var_dump($result); //"data:image/jpeg;base64,"  "data:image/jpeg;base64,"   "jpeg"
//var_dump($img); //返回的是资源，直接使用<img src="$img" />可以显示图片

/* 输出到文件 */
//方式一：直接使用file_put_contents
$tmp_file = time(). '.' .$type;
//file_put_contents($tmp_file, $img); //可以直接将文件流保存为本地图片

//方式一：先转换为GD图像资源，再生成文件或显示输出
$im = imagecreatefromstring($img); //resource(2) of type (gd) 图像资源
imagejpeg ($im, $tmp_file); //图像流（image）以 JPEG 格式输出到标准输出(浏览器或者文件)

//或者使用AliOSS上传
//$url = OSS::upload($img, $type);

return ajaxReturn($tmp_file);

function ajaxReturn($data = array(), $code = 0, $msg = '成功'){
	$result =  array(
		'result' => $data,
		'ecd' => $code,
		'msg' => $msg,
	);
	
	echo json_encode($result);
	exit;
}
