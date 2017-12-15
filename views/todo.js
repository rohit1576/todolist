function reBuildTodo()
{
	
	$("#todolist").empty();

	$.get('/<%=user.id%>/todo2',function(data){

		

		for(var i=0;i<data.length;i++)
		{
			
			$("ul").append("<li><span data-id ="+ data[i]._id +"><i class='fa fa-trash'></i></span> " + data[i].task  + "</li>")
		} 
	});
		
	
}


$("ul").on("click","span",function(event){

	//event.stopPropagation();

	var dataid = $(this).attr("data-id");
				
	$.ajax({
			type:'POST',
			url: '/<%=user._id%>/todo/'+ dataid + '?_method=DELETE',

			success: function()
			{
				
				//reBuildTodo();
				// $(this).parent().fadeOut(500,function(){
				// 	$(this).remove();
				//  });
				console.log('success function of delete called!')
				$(this).parent().remove();
				
				
			},
			error:function(error)
			{
				console.log('error!!!!');
			}
		})


});

$("input[type='text']").keypress(function(event){
	if(event.which === 13){
		//grabbing new todo text from input
		var todoText = $(this).val();
		
		//create a new li and add to ul
		

		$.ajax({
			type: 'POST',
			url:'/<%=user.id%>/todo',
			data: {task:todoText} })

			.then(function(newTodo){
				//reBuildTodo();
				$(this).val("");
				console.log(newTodo + "hello");
				$("ul").append("<li><span data-id ="+ newTodo._id +"><i class='fa fa-trash'></i></span> " + newTodo.task  + "</li>")
			})
			.catch(function()
			{
				console.log('error');
			})
		
	}
});

$(".fa-plus").click(function(){
	$("input[type='text'").fadeToggle()
});


