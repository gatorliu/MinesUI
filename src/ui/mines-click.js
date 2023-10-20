var cell_array = Array(16);

$(function () {
    //var cell_array = Array(16);
    var current_player;
    var current_Idx;
    var cutwayBtn = Array(5)
    cut_dirs = [
        []
      , [1, 0]
      , [0, 1]
      , [1, 1]
      , [1, -1]
    ];
    cut_way_color = [
      '',"red"
      ,"green"
      ,"blue"
    ]
    player_class = [
      ""
      ,"red"
      ,"green"
      ,"blue"
    ]
    
    function init() {
      for (i=0; i<16; i++) { 
        cell_array[i] = {
          cut_player:[NaN, "","","",""] 
          ,cut_cnt:0
          , cell : $('#'+i)
          , is_bomb: 0
        }; 
      }
      bomb = 0;
      while( bomb<2) {
        b = Math.floor(Math.random() * 16)
        if (cell_array[b].is_bomb == 0) {
          bomb += 1;
          cell_array[b].is_bomb = 1;
        }
      }
      // reset player 
      $('input[type="button"][value="P1"]').click()
      cutway = $('.cutway')
      cutway.prop('disabled',true)
     
      // cutwayBtn init
      cutway.each(i => cutwayBtn[i+1] = $(cutway[i]));
      
    }
    
    function reflash() {
      cell_array.forEach((elm, idx) => {
        //$('#'+idx+' > div > .cellinfo').text(elm.cut_cnt);
        //elm.cell.children().find('>.cellinfo').text(elm.cut_cnt);
        elm.cell.children().children().children().children().text(elm.cut_cnt);
   
      });
    }
    function encode(r, c) {
      return r*4+c
    }
    function decode(v) {
      return [Math.floor(v/4), v%4]
    }
    function cut_change_style(idx, way ) {
        cell = cell_array[idx].cell
        for (i = 2 ; i<=way ; i++) {
            cell = cell.children()
        } 
        cell.addClass('cut'+way)
        cell.addClass(player_class[current_player])
    }
    function cut(idx, way ) {
      cell_array[idx].cut_player[way]= current_player
      cell_array[idx].cut_cnt += 1
      cut_change_style(idx, way) 

      var r, c
      [r, c] = decode(idx)
      while (true) {
          
          r +=  cut_dirs[way][0];
          c +=  cut_dirs[way][1];
          if (r<0 ||  r==4 || c<0 || c==4) break;

          i = encode(r, c)
          cell_array[i].cut_player[way]= current_player
          cell_array[i].cut_cnt += 1
          cut_change_style(i, way) 
          
      }
      [r, c] = decode(idx)
      while (true) {
          r -=  cut_dirs[way][0];
          c -=  cut_dirs[way][1];
          if (r<0 ||  r==4 || c<0 || c==4) break;

          i = encode(r, c)
          cell_array[i].cut_player[way]= current_player
          cell_array[i].cut_cnt += 1
          cut_change_style(i, way) 
      }
      
      reflash()
    }
    
    
    $('.cell').click(function(){  
      //console.log(cell_array[this.id].cut_cnt);
      c = cell_array[this.id]
      if (c.cut_cnt < 4) {
        current_Idx = this.id
        for( i=1; i<=4; i++) {
          if ( c.cut_player[i] == "") {
              cutwayBtn[i].prop('disabled',false)
          }
        }
        
        $('.cutways').css('border', '3px solid ' + cut_way_color[current_player])
      }
    });

    $('.cutway').click(function(){
        cut(current_Idx,this.id)
        $('.cutway').prop('disabled',true)
        p = ((parseInt(current_player)+1) % 4)
        p = p==0 ? 1: p
        $('input[type="button"][value="P' + p + '"]').click()
        $('.cutway').css('border', '')
      });
  
    $('#btnBomb').click(function(){
      cell_array.forEach((elm, idx) => {
        if (elm.is_bomb == 1) {
          elm.cell.children().children().children().children().addClass("bomb");
        }
      });
    });
    
    $('.player').click(function(){
      //current_player = parseInt(($(this).val())[1])
      current_player = ($(this).val())[1]
      $('.player').css('border', '1px solid #999')
      $(this).css('border', '2px solid #000')

    });
  
    init()
    reflash();
  
  });