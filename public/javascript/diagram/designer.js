/**
 * Definition der Designerlogik
 */
angular.module('brainworks.diagram')
.controller('designerCtrl', ['$scope', '$state', 'localStorageService', 'diagramsFactory', 'diagram', function ($scope, $state, localStorageService, diagramsFactory, diagram) {
  $scope.oneAtATime = true;
  /* Initialisierung der Klassendiagramme */
  $scope.diagramTypes = [{name: 'Klassendiagramme', shapes: [{type: 'ActiveClass', name: 'Aktive Klasse'}, {type: 'EmptyClass', name: 'Klasse'}, {type: 'AbstractClass', name: 'Abstrakte Klasse'}, {type: 'Comment', name: 'Kommentar'}, {type: 'Class', name: 'Klasse'}, {type: 'Interface', name: 'Schnittstelle'}, {type: 'Inheritance', name: 'Vererbung'}, {type: 'Association', name: 'Assoziation'}, {type: 'UniDirectionalAssociation', name: 'Gerichtete Assoziation'}, {type: 'Aggregation', name: 'Aggregation'}, {type: 'Composition', name: 'Komposition'}, {type: 'Realization', name: 'Realisierung'}, {type: 'Dependency', name: 'Abhängigkeit'}, {type: 'Link', name: 'Verbinder'}]}];
  $scope.diagram = diagram;
  $scope.shapes = [];
  angular.forEach($scope.diagram.shapes, function(shape) {
    var tmp = new window[shape._type]();
    tmp.applyJSON(shape);
    $scope.shapes.push(tmp);
  });
  $scope.back = function() {
    $state.go('profile.diagrams');
  };
  /**
   * @param diagram
   */
  $scope.save = function(diagram) {
    var waitElement = $('#saveAnimation');
    var shapes = [];
    angular.forEach($scope.shapes, function(shape) {
      shapes.push(shape.toJSON());
    });
    diagram.shapes = shapes;
    waitElement.removeClass('hidden');
    /* Klonen des verwendeten Canvas Designers mit anderer Größe */
    var designerCanvas = $('.designer');
    var tmpCanvas = designerCanvas.clone();
    tmpCanvas.attr('height', '300px');
    tmpCanvas.attr('width', '700px');
    /* Speichern der Vorschau des Canvasausschnittes */
    var img = new Image();
    /**
     * Zeichnen der Canvasfläche der Klassendiagramme
     */
    img.onload = function() {
      tmpCanvas[0].getContext('2d').drawImage(img, 0, 0);
      var formData = new FormData();
      formData.append('thumbnail', tmpCanvas[0].toDataURL('image/png'));
      formData.append('diagram', JSON.stringify(diagram));
      diagramsFactory.saveDiagram(localStorageService.get('userId'), formData).success(function(response) {
        waitElement.addClass('hidden');
      });
    };
    img.src = designerCanvas[0].toDataURL();
  };
}])
.controller('attributesEditorCtrl', ['$scope', '$modalInstance', 'settings' , function($scope, $modalInstance, settings) {
  $scope.settings = settings;
  /**
   *
   */
  $scope.save = function() {
    $modalInstance.close($scope.settings);
  };
  /**
   *
   */
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
}])
.directive('designer', ['$modal', function($modal) {
  return {
    restrict: 'E',
    replace: true,
    template: '<canvas class="designer" height="5000px" width="5000px" tabIndex="1"></canvas>',
    /**
     * Der Bearbeitungsmodus für die Elemente wird definiert
     */
    link: function(scope, element, attr) {
      var draw = function() {
        var context = element[0].getContext('2d');
        context.clearRect(0, 0, 5000, 5000);
        angular.forEach(scope.shapes, function(value) {
          value.draw(element[0]);
        });
        /* Initialisiert Bearbeitungspunkte und Umrandung der Klassenelemente beim Bearbeiten*/
        if(selected instanceof Shape && angular.isDefined(selected) && selected !== null) {
          context.save();
          context.beginPath();
          context.strokeStyle = 'gray';
          context.fillStyle = 'gray';
          context.lineWidth = 1;
          context.setLineDash([5, 2]);
          context.strokeRect(selected.getX() - 5, selected.getY() - 5, selected.getWidth() + 10, selected.getHeight() + 10);
          context.setLineDash([]);
          context.fillRect(selected.getX() - 8, selected.getY() - 8, 6, 6);
          context.fillRect(selected.getX() - 8, selected.getY() + (selected.getHeight()/2) - 2, 6, 6);
          context.fillRect(selected.getX() - 8, selected.getY() + selected.getHeight() + 2, 6, 6);
          context.fillRect(selected.getX() + (selected.getWidth()/2) - 2, selected.getY() + selected.getHeight() + 2, 6, 6);
          context.fillRect(selected.getX() + selected.getWidth() + 2, selected.getY() + selected.getHeight() + 2, 6, 6);
          context.fillRect(selected.getX() + selected.getWidth() + 2, selected.getY() + (selected.getHeight()/2) - 2, 6, 6);
          context.fillRect(selected.getX() + selected.getWidth() + 2, selected.getY() - 8, 6, 6);
          context.fillRect(selected.getX() + (selected.getWidth()/2) - 2, selected.getY() - 8, 6, 6);
          context.closePath();
          context.stroke();
          context.restore();
        } else if(angular.isDefined(selected) && selected !== null) { /* Fügt Bearbeitungspunkte an das Beziehungselement */
          var deltaX = selected.getCoordsB()[0] - selected.getCoordsA()[0];
          var deltaY = selected.getCoordsB()[1] - selected.getCoordsA()[1];
          var length = Math.abs(Math.sqrt(Math.pow(deltaY, 2) + Math.pow(deltaX, 2)));
          context.save();
          context.beginPath();
          context.strokeStyle = 'gray';
          context.translate(selected.getCoordsA()[0], selected.getCoordsA()[1]);
          context.rotate(Math.atan2(deltaY, deltaX));
          context.translate(-selected.getCoordsA()[0], -selected.getCoordsA()[1]);
          context.arc(selected.getCoordsA()[0] - 3, selected.getCoordsA()[1], 3, 0, 2*Math.PI);
          context.closePath();
          context.stroke();
          context.beginPath();
//          context.arc(selected.getCoordsA()[0] + length + 3, selected.getCoordsA()[1], 3, 0, 2*Math.PI);
          context.closePath();
          context.stroke();
          context.restore();
        }
        /* Anheften von Beziehungen an Elemente
         * Beim Verbinden von Elementen mit Beziehungen werden die Elemente A und B rötlich umrandet und
         */
        if(shapeA !== null) {
          var context = element[0].getContext('2d');
          context.save();
          context.beginPath();
          context.shadowBlur = 5;
          context.shadowColor = 'red';
          context.strokeRect(shapeA.getX(), shapeA.getY(), shapeA.getWidth(), shapeA.getHeight());
          context.closePath();
          context.restore();
        }
        if(shapeB !== null) {
          var context = element[0].getContext('2d');
          context.save();
          context.beginPath();
          context.shadowBlur = 10;
          context.shadowColor = 'red';
          context.strokeRect(shapeB.getX(), shapeB.getY(), shapeB.getWidth(), shapeB.getHeight());
          context.closePath();
          context.restore();
        }
      };
      if(attr.editable) {
        var selected = null;
        var positionX = 0;
        var positionY = 0;
        var drag = false;
        var resize = false;
        var resizeDirection = '';
        var dragPoint = '';
        var clicks = 0;
        var inEditmode = false;
        var shapeA = null;
        var shapeB = null;
        $(element).droppable({
          accept: '.designer-element',
          /**
           * Bestimmt Area, auf der Elemente gezeichnet werden dürfen
           * @param event
           * @param ui
           */
          drop: function(event, ui) {
            var y = ui.helper.position().top - $(element).parent().offset().top;
            var x = ui.helper.position().left - $(element).parent().offset().left;
            scope.shapes.push(window[ui.helper.attr('type')].prototype instanceof Shape ? new window[ui.helper.attr('type')](scope.diagram.elementId, x, y, 140, 90, ui.helper.attr('name')) : new window[ui.helper.attr('type')](scope.diagram.elementId, [x, y + 45], [x + 140, y + 45], ''));
            scope.diagram.elementId++;
            draw();
          },
          /**
           * Cursor layout in der Area über der Designer Fläche, auf der Elemente plaziert werden dürfen
           * @param event
           * @param ui
           */
          over: function(event, ui) {
            ui.helper.css('cursor', 'copy');
          },
          /**
           * Cursor layour in der Area ausserhalb der Canvas Fläche
           * @param event
           * @param ui
           */
          out: function(event, ui) {
            ui.helper.css('cursor', 'no-drop');
          }
        });
        /**
         * Es wird eine kleine Pause initialisiert und die Klicks wieder zurückgesetzt
         */
        element.on('mousedown', function(event) {
          setTimeout(function() {
            clicks = 0;
          }, 400);
          /* Wenn im Editmode woanders hingeklickt wird, wird dieser & die Auswahl aufgehoben */
          if(inEditmode && angular.isDefined(selected) && selected !== null) {
            inEditmode = false;
            selected = null;
          }
          var result = $.grep(scope.shapes,
            /**
             * Definition der Bearbeitungsfläche des ausgewählten Elementes
             * @param shape
             */
            function(shape) {
            var isSelected = false;
            if(shape instanceof Shape) {
              /* Definition der Bearbeitungsfläche von Klassenelementen*/
              isSelected = event.layerX >= shape.getX() - 8 && event.layerX <= (shape.getX() + shape.getWidth() + 8) && event.layerY >= shape.getY() - 8 && event.layerY <= (shape.getY() + shape.getHeight() + 8);
            } else {
              /* Definition der Bearbeitungsfläche der Beziehungselemente */
              var context = element[0].getContext('2d');
              var deltaX = shape.getCoordsB()[0] - shape.getCoordsA()[0];
              var deltaY = shape.getCoordsB()[1] - shape.getCoordsA()[1];
              var length = Math.abs(Math.sqrt(Math.pow(deltaY, 2) + Math.pow(deltaX, 2)));
              context.save();
              context.translate(shape.getCoordsA()[0], shape.getCoordsA()[1]);
              context.rotate(Math.atan2(deltaY, deltaX));
              context.translate(-shape.getCoordsA()[0], -shape.getCoordsA()[1]);
              context.beginPath();
              context.rect(shape.getCoordsA()[0], shape.getCoordsA()[1]-5, length, 10);
              isSelected = context.isPointInPath(event.layerX, event.layerY);
              context.closePath();
              context.beginPath();
              context.arc(shape.getCoordsA()[0] - 3, shape.getCoordsA()[1], 3, 0, 2*Math.PI);
              isSelected = isSelected || context.isPointInPath(event.layerX, event.layerY);
              context.closePath();
              context.beginPath();
              context.arc(shape.getCoordsA()[0] + length + 3, shape.getCoordsA()[1], 3, 0, 2*Math.PI);
              isSelected = isSelected || context.isPointInPath(event.layerX, event.layerY);
              context.closePath();
              context.restore();
            }
            return isSelected;
          });
          var selectedInResult = false;
          $.each(result,
            /**
             * Element als selected markieren
             * @param index
             * @param selection
             */
            function(index, selection) {
            if(angular.isDefined(selected) && selected !== null && selection._id === selected._id) {
              selectedInResult = true;
              return false;
            }
          });
          var oldSelected = selected;
          if(selected === null || !selectedInResult) {
            selected = result[0];
          }
          /* Erhöhe die Clicks um 1, wenn */
          if(!angular.isDefined(oldSelected) || oldSelected === null || !angular.isDefined(selected) || selected === null || oldSelected._id === selected._id) {
            clicks++;
          }
          /* Bei zwei Klicks soll ein Dialog zum Ändern der Eigenschaften erscheinen */
          if(clicks === 2) {
            oldSelected = null;
            clicks = 0;
            if(angular.isDefined(selected) && selected !== null) {
              selected.startEditmode($modal, draw);
              inEditmode = true;
            }
          } else {
            positionX = event.layerX;
            positionY = event.layerY;
            /* Wenn in die Dragfläche geklickt wird, wird "drag" aktiviert */
            if(selected instanceof Shape && angular.isDefined(selected) && selected !== null &&
              positionX >= selected.getX() && positionX <= (selected.getX() + selected.getWidth()) &&
              positionY >= selected.getY() && positionY <= (selected.getY() + selected.getHeight())
            ) {
              drag = true;
            } else if(selected instanceof Shape && angular.isDefined(selected) && selected !== null) { /* Anpassen der Größe eines Klassenelements auf der Canvasfläche */
              resize = true;
              if(positionX >= selected.getX() - 8 && positionX <= selected.getX() - 2 && positionY >= selected.getY() - 8 && positionY <= selected.getY() - 2) {
                resizeDirection = 'up left';
              } else if(positionX >= selected.getX() + selected.getWidth() + 2 && positionX <= selected.getX() + selected.getWidth() + 8 && positionY >= selected.getY() + selected.getHeight() + 2 && positionY <= (selected.getY() + selected.getHeight() + 8)){
                resizeDirection = 'down right';
              } else if(positionX >= selected.getX() + selected.getWidth() + 2 && positionX <= selected.getX() + selected.getWidth() + 8 && positionY >= selected.getY() - 8 && positionY <= selected.getY() - 2) {
                resizeDirection = 'up right';
              } else if(positionX >= selected.getX() - 8 && positionX <= selected.getX() - 2 && positionY >= selected.getY() + selected.getHeight() + 2 && positionY <= (selected.getY() + selected.getHeight() + 8)) {
                resizeDirection = 'down left';
              } else if(positionX >= selected.getX() - 8 && positionX <= selected.getX() - 2 && positionY >= selected.getY() + (selected.getHeight()/2) - 2 && positionY <= selected.getY() + (selected.getHeight()/2) + 4) {
                resizeDirection = 'left';
              } else if(positionX >= selected.getX() + selected.getWidth() + 2 && positionX <= selected.getX() + selected.getWidth() + 8 && positionY >= selected.getY() + (selected.getHeight()/2) - 2 && positionY <= selected.getY() + (selected.getHeight()/2) + 4) {
                resizeDirection = 'right';
              } else if(positionX >= selected.getX() + (selected.getWidth()/2) - 2 && positionX <= selected.getX() + (selected.getWidth()/2) + 4 && positionY >= selected.getY() - 8 && positionY <= selected.getY() - 2) {
                resizeDirection = 'up';
              } else if ( positionX >= selected.getX() + (selected.getWidth() / 2) - 2 && positionX <= selected.getX() + (selected.getWidth() / 2) + 4 && positionY >= selected.getY() + selected.getHeight() + 2 && positionY <= (selected.getY() + selected.getHeight() + 8)) {
                resizeDirection = 'down';
              }
            } else if (selected instanceof Relation && angular.isDefined(selected) && selected !== null) { /* Beziehung bei der Auswahl */
              var context = element[0].getContext('2d');
              var deltaX = selected.getCoordsB()[0] - selected.getCoordsA()[0];
              var deltaY = selected.getCoordsB()[1] - selected.getCoordsA()[1];
              var length = Math.abs(Math.sqrt(Math.pow(deltaY, 2) + Math.pow(deltaX, 2)));
              context.save();
              context.beginPath();
              context.translate(selected.getCoordsA()[0], selected.getCoordsA()[1]);
              context.rotate(Math.atan2(deltaY, deltaX));
              context.translate(-selected.getCoordsA()[0], -selected.getCoordsA()[1]);
              context.rect(selected.getCoordsA()[0], selected.getCoordsA()[1]-5, length, 10);
              /* definiert die draglinie in einer Beziehung */
              if(context.isPointInPath(event.layerX, event.layerY)) {
                dragPoint = 'shape';
              }
              context.closePath();
              context.beginPath();
              context.arc(selected.getCoordsA()[0] - 3, selected.getCoordsA()[1], 3, 0, 2*Math.PI);
              /* definiert den ersten Punkt einer Beziehung */
              if(dragPoint === '' && context.isPointInPath(event.layerX, event.layerY)) {
                dragPoint = 'pointA';
              }
              context.closePath();
              context.beginPath();
              context.arc(selected.getCoordsA()[0] + length + 3, selected.getCoordsA()[1], 3, 0, 2*Math.PI);
              /* definiert den zweiten Punkt einer Beziehung */
              if(dragPoint === '' && context.isPointInPath(event.layerX, event.layerY)) {
                dragPoint = 'pointB';
              }
              context.closePath();
              drag = dragPoint !== '';
              context.restore();
            }
            draw();
          }
        });
        element.on('mousemove', function(event) {
          if(angular.isDefined(selected) && selected !== null) {
            var cursor = 'initial';
            /* Layout des Cursors wird angepasst */
            if(selected instanceof Relation) {
              var context = element[0].getContext('2d');
              var deltaX = selected.getCoordsB()[0] - selected.getCoordsA()[0];
              var deltaY = selected.getCoordsB()[1] - selected.getCoordsA()[1];
              var length = Math.abs(Math.sqrt(Math.pow(deltaY, 2) + Math.pow(deltaX, 2)));
              context.save();
              context.beginPath();
              context.translate(selected.getCoordsA()[0], selected.getCoordsA()[1]);
              context.rotate(Math.atan2(deltaY, deltaX));
              context.translate(-selected.getCoordsA()[0], -selected.getCoordsA()[1]);
              context.rect(selected.getCoordsA()[0], selected.getCoordsA()[1]-5, length, 10);
              /* Cursor über der Beziehung */
              if(context.isPointInPath(event.layerX, event.layerY)) {
                cursor = 'move';
              }
              context.closePath();
              context.beginPath();
              context.arc(selected.getCoordsA()[0] - 3, selected.getCoordsA()[1], 3, 0, 2*Math.PI);
              /* Cursor am rechten Punkt der Beziehung */
              if(cursor === 'initial' && context.isPointInPath(event.layerX, event.layerY)) {
                cursor = 'move';
              }
              context.closePath();
              context.beginPath();
              context.arc(selected.getCoordsA()[0] + length + 3, selected.getCoordsA()[1], 3, 0, 2*Math.PI);
              /* Cursor am linken Punkt der Beziehung */
              if(cursor === 'initial' && context.isPointInPath(event.layerX, event.layerY)) {
                cursor = 'move';
              }
              context.closePath();
              context.restore();
            } else if(event.layerX >= selected.getX() && event.layerX <= (selected.getX() + selected.getWidth()) && event.layerY >= selected.getY() && event.layerY <= (selected.getY() + selected.getHeight())) {
              cursor = 'move'; /* Bewegungscursor */
            } else if(
              event.layerX >= selected.getX() - 8 && event.layerX <= selected.getX() - 2 && event.layerY >= selected.getY() - 8 && event.layerY <= selected.getY() - 2 ||
              event.layerX >= selected.getX() + selected.getWidth() + 2 && event.layerX <= selected.getX() + selected.getWidth() + 8 && event.layerY >= selected.getY() + selected.getHeight() + 2 && event.layerY <= (selected.getY() + selected.getHeight() + 8)
            ) {
              cursor = 'se-resize'; /* Oben-Links oder Unten-Rechts Größenänderungscursor */
            } else if(
              event.layerX >= selected.getX() + selected.getWidth() + 2 && event.layerX <= selected.getX() + selected.getWidth() + 8 && event.layerY >= selected.getY() - 8 && event.layerY <= selected.getY() - 2 ||
              event.layerX >= selected.getX() - 8 && event.layerX <= selected.getX() - 2 && event.layerY >= selected.getY() + selected.getHeight() + 2 && event.layerY <= (selected.getY() + selected.getHeight() + 8)
            ) {
              cursor = 'sw-resize'; /* Oben-Rechts oder Unten-Links Größenänderungscursor */
            } else if(
              event.layerX >= selected.getX() - 8 && event.layerX <= selected.getX() - 2 && event.layerY >= selected.getY() + (selected.getHeight()/2) - 2 && event.layerY <= selected.getY() + (selected.getHeight()/2) + 4 ||
              event.layerX >= selected.getX() + selected.getWidth() + 2 && event.layerX <= selected.getX() + selected.getWidth() + 8 && event.layerY >= selected.getY() + (selected.getHeight()/2) - 2 && event.layerY <= selected.getY() + (selected.getHeight()/2) + 4
            ) {
              cursor = 'e-resize'; /* Rechts oder Links Größenänderungscursor */
            } else if(
              event.layerX >= selected.getX() + (selected.getWidth()/2) - 2 && event.layerX <= selected.getX() + (selected.getWidth()/2) + 4 && event.layerY >= selected.getY() - 8 && event.layerY <= selected.getY() - 2 ||
              event.layerX >= selected.getX() + (selected.getWidth()/2) - 2 && event.layerX <= selected.getX() + (selected.getWidth()/2) + 4 && event.layerY >= selected.getY() + selected.getHeight() + 2 && event.layerY <= (selected.getY() + selected.getHeight() + 8)
            ) {
              cursor = 'n-resize'; /* Oben oder Unten Größenänderungscursor */
            }
            /* Setzen des Cursors */
            if(!drag && !resize) {
              element.css({
                cursor: cursor
              });
            }
            /* Speichern der Position des Klassenelementes */
            if(selected instanceof Shape) {
              var oldX = selected.getX();
              var oldY = selected.getY();
              var oldHeight = selected.getHeight();
              var oldWidth = selected.getWidth();
            }
            /* Resize des Klassenelementes */
            if(resize) {
              var moveX = 0;
              var moveY = 0;
              var x = selected.getX();
              var y = selected.getY();
              switch(resizeDirection) {
                case 'up left':
                  moveX = selected.getX()- event.layerX;
                  moveY = selected.getY()- event.layerY;
                  x = event.layerX;
                  y = event.layerY;
                  break;
                case 'down right':
                  moveX = event.layerX - (selected.getWidth() + selected.getX());
                  moveY = event.layerY - (selected.getHeight() + selected.getY());
                  break;
                case 'up right':
                  moveX = event.layerX - (selected.getWidth() + selected.getX());
                  moveY = selected.getY()- event.layerY;
                  y = event.layerY;
                  break;
                case 'down left':
                  moveY = event.layerY - (selected.getHeight() + selected.getY());
                  moveX = selected.getX()- event.layerX;
                  x = event.layerX;
                  break;
                case 'right':
                  moveX = event.layerX - (selected.getWidth() + selected.getX());
                  break;
                case 'left':
                  moveX = selected.getX()- event.layerX;
                  x = event.layerX;
                  break;
                case 'up':
                  moveY = selected.getY()- event.layerY;
                  y = event.layerY;
                  break;
                case 'down':
                  moveY = event.layerY - (selected.getHeight() + selected.getY());
                  break;
              }
              selected.setX(x);
              selected.setY(y);
              selected.setWidth(Math.max(1, selected.getWidth() + moveX));
              selected.setHeight(Math.max(1, selected.getHeight() + moveY));
            } else if(drag && dragPoint === '') { /* Bewegung des gesamten Klassenelementes */
              selected.setX(selected.getX() + event.layerX - positionX);
              selected.setY(selected.getY() + event.layerY - positionY);
              positionX = event.layerX;
              positionY = event.layerY;
            } else if(drag && dragPoint !== '') { /* Bewegung der Beziehungslinie */
              /* Bewegung bei verschiedenen dragpoints (Klassenelement oder einer der beiden dragpoints des Beziehungselementes) */
              switch(dragPoint) {
                case 'shape':
                  selected.setCoordsA([selected.getCoordsA()[0] + event.layerX - positionX, selected.getCoordsA()[1] + event.layerY - positionY]);
                  selected.setCoordsB([selected.getCoordsB()[0] + event.layerX - positionX, selected.getCoordsB()[1] + event.layerY - positionY]);
                  break;
                case 'pointA':
                  selected.setCoordsA([selected.getCoordsA()[0] + event.layerX - positionX, selected.getCoordsA()[1] + event.layerY - positionY]);
                  break;
                case 'pointB':
                  selected.setCoordsB([selected.getCoordsB()[0] + event.layerX - positionX, selected.getCoordsB()[1] + event.layerY - positionY]);
                  break;
              }
              shapeA = null;
              shapeB = null;
              angular.forEach(scope.shapes,
                /**
                 * Umrandung der Klassenelemente bei Verknüpfung zwischen dem Beziehungselement und dem Klassenelement
                 * @param shape
                 */
                function(shape) {
                if(shape instanceof Shape) {
                  if((selected.getCoordsA()[0] > shape.getX() - 5 && selected.getCoordsA()[0] < shape.getX() + shape.getWidth() + 5 && selected.getCoordsA()[1] > shape.getY() - 5 && selected.getCoordsA()[1] < shape.getY() + 5)
                    || (selected.getCoordsA()[0] > shape.getX() + shape.getWidth() - 5 && selected.getCoordsA()[0] < shape.getX() + shape.getWidth() + 5 && selected.getCoordsA()[1] > shape.getY() - 5 && selected.getCoordsA()[1] < shape.getY() + shape.getHeight() + 5)
                    || (selected.getCoordsA()[0] > shape.getX() - 5 && selected.getCoordsA()[0] < shape.getX() + 5 && selected.getCoordsA()[1] > shape.getY() - 5 && selected.getCoordsA()[1] < shape.getY() + shape.getHeight() + 5)
                    || (selected.getCoordsA()[0] > shape.getX() - 5 && selected.getCoordsA()[0] < shape.getX() + shape.getWidth() + 5 && selected.getCoordsA()[1] > shape.getY() + shape.getHeight() - 5 && selected.getCoordsA()[1] < shape.getY() + shape.getHeight() + 5)) {
                    shapeA = shape;
                  } else if((selected.getCoordsB()[0] > shape.getX() - 5 && selected.getCoordsB()[0] < shape.getX() + shape.getWidth() + 5 && selected.getCoordsB()[1] > shape.getY() - 5 && selected.getCoordsB()[1] < shape.getY() + 5)
                    || (selected.getCoordsB()[0] > shape.getX() + shape.getWidth() - 5 && selected.getCoordsB()[0] < shape.getX() + shape.getWidth() + 5 && selected.getCoordsB()[1] > shape.getY() - 5 && selected.getCoordsB()[1] < shape.getY() + shape.getHeight() + 5)
                    || (selected.getCoordsB()[0] > shape.getX() - 5 && selected.getCoordsB()[0] < shape.getX() + 5 && selected.getCoordsB()[1] > shape.getY() - 5 && selected.getCoordsB()[1] < shape.getY() + shape.getHeight() + 5)
                    || (selected.getCoordsB()[0] > shape.getX() - 5 && selected.getCoordsB()[0] < shape.getX() + shape.getWidth() + 5 && selected.getCoordsB()[1] > shape.getY() + shape.getHeight() - 5 && selected.getCoordsB()[1] < shape.getY() + shape.getHeight() + 5)) {
                    shapeB = shape;
                  }
                }
              });
              selected.setShapeA(shapeA !== null ? shapeA._id : null);
              selected.setShapeB(shapeB !== null ? shapeB._id : null);
              positionX = event.layerX;
              positionY = event.layerY;
            }
            if(drag || resize) {
              if(selected instanceof Shape) {
                angular.forEach(scope.shapes,
                  /**
                   * Resize der Beziehungslinie
                   *@param shape
                   */
                  function(shape) {
                  if(shape instanceof Relation) {
                    /* Bewegung der Beziehungselemente bei Bewegung des Klassenelementes, welches mit den Bearbeitungspunkten verbunden ist */
                    if(shape.getShapeA() === selected._id) {
                      if(drag
                        || (resizeDirection === 'up left' || resizeDirection === 'left' || resizeDirection === 'down left') && (shape.getCoordsA()[0] > oldX - 5 && shape.getCoordsA()[0] < oldX + 5 && shape.getCoordsA()[1] > oldY - 5 && shape.getCoordsA()[1] < oldY + oldHeight + 5)
                        || (resizeDirection === 'up left' || resizeDirection === 'up' || resizeDirection === 'up right') && (shape.getCoordsA()[0] > oldX - 5 && shape.getCoordsA()[0] < oldX + oldWidth + 5 && shape.getCoordsA()[1] > oldY - 5 && shape.getCoordsA()[1] < oldY + 5)) {
                        shape.setCoordsA([shape.getCoordsA()[0] + selected.getX() - oldX, shape.getCoordsA()[1] + selected.getY() - oldY]);
                      } else if((resizeDirection === 'up right' || resizeDirection === 'right' || resizeDirection === 'down right') && (shape.getCoordsA()[0] > oldX + oldWidth - 5 && shape.getCoordsA()[0] < oldX + oldWidth + 5 && shape.getCoordsA()[1] > oldY - 5 && shape.getCoordsA()[1] < oldY + oldHeight + 5)
                        || (resizeDirection === 'down left' || resizeDirection === 'down' || resizeDirection === 'down right') && (shape.getCoordsA()[0] > oldX - 5 && shape.getCoordsA()[0] < oldX + oldWidth + 5 && shape.getCoordsA()[1] > oldY + oldHeight - 5 && shape.getCoordsA()[1] < oldY + oldHeight + 5)) {
                        shape.setCoordsA([shape.getCoordsA()[0] + selected.getX() + selected.getWidth() - oldWidth - oldX, shape.getCoordsA()[1] + selected.getY() + selected.getHeight() - oldHeight - oldY]);
                      }
                    } else if(shape.getShapeB() === selected._id) {
                      if(drag
                        || (resizeDirection === 'up left' || resizeDirection === 'left' || resizeDirection === 'down left') && (shape.getCoordsB()[0] > oldX - 5 && shape.getCoordsB()[0] < oldX + 5 && shape.getCoordsB()[1] > oldY - 5 && shape.getCoordsB()[1] < oldY + oldHeight + 5)
                        || (resizeDirection === 'up left' || resizeDirection === 'up' || resizeDirection === 'up right') && (shape.getCoordsB()[0] > oldX - 5 && shape.getCoordsB()[0] < oldX + oldWidth + 5 && shape.getCoordsB()[1] > oldY - 5 && shape.getCoordsB()[1] < oldY + 5)) {
                        shape.setCoordsB([shape.getCoordsB()[0] + selected.getX() - oldX, shape.getCoordsB()[1] + selected.getY() - oldY]);
                      } else if((resizeDirection === 'up right' || resizeDirection === 'right' || resizeDirection === 'down right') && (shape.getCoordsB()[0] > oldX + oldWidth - 5 && shape.getCoordsB()[0] < oldX + oldWidth + 5 && shape.getCoordsB()[1] > oldY - 5 && shape.getCoordsB()[1] < oldY + oldHeight + 5)
                        || (resizeDirection === 'down left' || resizeDirection === 'down' || resizeDirection === 'down right') && (shape.getCoordsB()[0] > oldX - 5 && shape.getCoordsB()[0] < oldX + oldWidth + 5 && shape.getCoordsB()[1] > oldY + oldHeight - 5 && shape.getCoordsB()[1] < oldY + oldHeight + 5)) {
                        shape.setCoordsB([shape.getCoordsB()[0] + selected.getX() + selected.getWidth() - oldWidth - oldX, shape.getCoordsB()[1] + selected.getY() + selected.getHeight() - oldHeight - oldY]);
                      }
                    }
                  }
                });
              }
              draw();
            }
          }
        });
        element.on('mouseup',
          /**
           * Beim Mouseup wird das Beziehungselement, welches mit einem Klassenelement verbunden werden soll an dieses angefügt, so dass es optimal verbunden ist
           * @param event
           */
          function(event) {
          if(shapeA !== null) {
            if(selected.getCoordsA()[0] > shapeA.getX() - 5 && selected.getCoordsA()[0] < shapeA.getX() + shapeA.getWidth() + 5 && selected.getCoordsA()[1] > shapeA.getY() - 5 && selected.getCoordsA()[1] < shapeA.getY() + 5) {
              selected.setCoordsA([selected.getCoordsA()[0] > shapeA.getX() + shapeA.getWidth() && selected.getCoordsA()[0] < shapeA.getX() + shapeA.getWidth() + 5 ? shapeA.getX() + shapeA.getWidth() : Math.max(selected.getCoordsA()[0], shapeA.getX() - 1), shapeA.getY() - 1]);
            } else if(selected.getCoordsA()[0] > shapeA.getX() - 5 && selected.getCoordsA()[0] < shapeA.getX() + shapeA.getWidth() + 5 && selected.getCoordsA()[1] > shapeA.getY() + shapeA.getHeight() - 5 && selected.getCoordsA()[1] < shapeA.getY() + shapeA.getHeight() + 5) {
              selected.setCoordsA([selected.getCoordsA()[0] > shapeA.getX() + shapeA.getWidth() && selected.getCoordsA()[0] < shapeA.getX() + shapeA.getWidth() + 5 ? shapeA.getX() + shapeA.getWidth() : Math.max(selected.getCoordsA()[0], shapeA.getX() - 1), shapeA.getY() + shapeA.getHeight() + 1]);
            } else if(selected.getCoordsA()[0] > shapeA.getX() + shapeA.getWidth() - 5 && selected.getCoordsA()[0] < shapeA.getX() + shapeA.getWidth() + 5 && selected.getCoordsA()[1] > shapeA.getY() - 5 && selected.getCoordsA()[1] < shapeA.getY() + shapeA.getHeight() + 5) {
              selected.setCoordsA([shapeA.getX() + shapeA.getWidth() + 1, selected.getCoordsA()[1] > shapeA.getY() + shapeA.getHeight() && selected.getCoordsA()[1] < shapeA.getY() + shapeA.getHeight() + 5 ? shapeA.getY() + shapeA.getHeight() : Math.max(selected.getCoordsA()[1], shapeA.getY() - 1)]);
            } else if(selected.getCoordsA()[0] > shapeA.getX() - 5 && selected.getCoordsA()[0] < shapeA.getX() + 5 && selected.getCoordsA()[1] > shapeA.getY() - 5 && selected.getCoordsA()[1] < shapeA.getY() + shapeA.getHeight() + 5) {
              selected.setCoordsA([shapeA.getX() - 1, selected.getCoordsA()[1] > shapeA.getY() + shapeA.getHeight() && selected.getCoordsA()[1] < shapeA.getY() + shapeA.getHeight() + 5 ? shapeA.getY() + shapeA.getHeight() : Math.max(selected.getCoordsA()[1], shapeA.getY() - 1)]);
            }
            shapeA = null;
          }
          if(shapeB !== null) {
            if(selected.getCoordsB()[0] > shapeB.getX() - 5 && selected.getCoordsB()[0] < shapeB.getX() + shapeB.getWidth() + 5 && selected.getCoordsB()[1] > shapeB.getY() - 5 && selected.getCoordsB()[1] < shapeB.getY() + 5) {
              selected.setCoordsB([selected.getCoordsB()[0] > shapeB.getX() + shapeB.getWidth() && selected.getCoordsB()[0] < shapeB.getX() + shapeB.getWidth() + 5 ? shapeB.getX() + shapeB.getWidth() : Math.max(selected.getCoordsB()[0], shapeB.getX() - 1), shapeB.getY() - 1]);
            } else if(selected.getCoordsB()[0] > shapeB.getX() - 5 && selected.getCoordsB()[0] < shapeB.getX() + shapeB.getWidth() + 5 && selected.getCoordsB()[1] > shapeB.getY() + shapeB.getHeight() - 5 && selected.getCoordsB()[1] < shapeB.getY() + shapeB.getHeight() + 5) {
              selected.setCoordsB([selected.getCoordsB()[0] > shapeB.getX() + shapeB.getWidth() && selected.getCoordsB()[0] < shapeB.getX() + shapeB.getWidth() + 5 ? shapeB.getX() + shapeB.getWidth() : Math.max(selected.getCoordsB()[0], shapeB.getX() - 1), shapeB.getY() + shapeB.getHeight() + 1]);
            } else if(selected.getCoordsB()[0] > shapeB.getX() + shapeB.getWidth() - 5 && selected.getCoordsB()[0] < shapeB.getX() + shapeB.getWidth() + 5 && selected.getCoordsB()[1] > shapeB.getY() - 5 && selected.getCoordsB()[1] < shapeB.getY() + shapeB.getHeight() + 5) {
              selected.setCoordsB([shapeB.getX() + shapeB.getWidth() + 1, selected.getCoordsB()[1] > shapeB.getY() + shapeB.getHeight() && selected.getCoordsB()[1] < shapeB.getY() + shapeB.getHeight() + 5 ? shapeB.getY() + shapeB.getHeight() : Math.max(selected.getCoordsB()[1], shapeB.getY() - 1)]);
            } else if(selected.getCoordsB()[0] > shapeB.getX() - 5 && selected.getCoordsB()[0] < shapeB.getX() + 5 && selected.getCoordsB()[1] > shapeB.getY() - 5 && selected.getCoordsB()[1] < shapeB.getY() + shapeB.getHeight() + 5) {
              selected.setCoordsB([shapeB.getX() - 1, selected.getCoordsB()[1] > shapeB.getY() + shapeB.getHeight() && selected.getCoordsB()[1] < shapeB.getY() + shapeB.getHeight() + 5 ? shapeB.getY() + shapeB.getHeight() : Math.max(selected.getCoordsB()[1], shapeB.getY() - 1)]);
            }
            shapeB = null;
          }
          drag = false;
          resize = false;
          resizeDirection = '';
          dragPoint = '';
          draw();
        });
        element.on('keydown',
          /**
           * Drücken von entf soll das zu bearbeitende Element löschen
           * @param event
           */
          function(event) {
          if(angular.isDefined(selected) && selected !== null && event.keyCode === 46) {
            element.css({
              cursor: 'initial'
            });
            scope.shapes = $.grep(scope.shapes, function(shape) { return shape._id !== selected._id; });
            selected = null;
            drag = false;
            resize = false;
            resizeDirection = '';
            draw();
          }
        });
      }
      draw();
    }
  };
}])
.directive('designerElement',
  /**
   * Vergabe von Cursoreigenschaften beim Arbeiten mit Elementen
   * @param document
   */
  function($document) {
  return {
    restrict: 'E',
    replace: true,
    template: '<canvas class="designer-element" height="90" width="140"></canvas>',
    /**
     * Zeichnen der Klassenelemente und Beziehungselemente auf der Klassendiagramm-Canvasfläche
     * @param scope
     * @param element
     * @param attr
     */
    link: function(scope, element, attr) {
      var offsetX, offsetY;
      var shape = window[attr.type].prototype instanceof Shape ? new window[attr.type](0, 0, 0, 140, 90, attr.name) : new window[attr.type](0, [0, 45], [140, 45], attr.name);
      shape.draw(element[0]);
      /* Drag & Drop für die Elemente */
      $(element).draggable({
        helper: 'clone',
        appendTo: $('#designerContainer'),
        containment: $('#designerContainer'),
        /**
         * Verändert den Curser bei dem Versuch ein Element auf eine nicht dropbare Fläche zu ziehen
         * @param event
         * @param ui
         */
        start: function(event, ui) {
          shape.draw(ui.helper[0]);
          ui.helper.css('cursor', 'no-drop');
        },
        /**
         * Versetzt den Cursor beim plazieren des Elementes wieder in sein Standartlayout
         * @param event
         * @param ui
         */
        stop: function(event, ui) {
          ui.helper.css('cursor', 'initial');
        }
      });
      /**
       * Setzt einen grauen Hintergrund an mit dem Curser ausgewählte Elemente
       * @param event
       */
      element.on('mouseover', function(event) {
        element.addClass('designer-element-active');
      });
      /**
       * Nimmt den grauen Hintergrund der Elemente wieder weg, wenn der Cursor die Elemente verlässt
       * @param event
       */
      element.on('mouseout', function(event) {
        element.removeClass('designer-element-active');
      });
    }
  };
});