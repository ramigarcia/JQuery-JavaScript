//Variables
console.log('hola mundo!');
const noCambia = "Ramiro";

let cambia = "@RamiroGarcia";

function cambiarNombre(nuevoNombre) {
  cambia = nuevoNombre;
}

//Promesas

const getUserFive = new Promise(function(todoBien, todoMal){
  //lammar a un api
  setTimeout(function(){
    //Despues de 3 segundos
    todoBien('Todo bien');
  }, 5000);
});

const getUser = new Promise(function(todoBien, todoMal){
  //lammar a un api
  setTimeout(function(){
    //Despues de 3 segundos
    todoBien('Todo mal');
  }, 3000);
});
/* 
getUser
  .then(function(){
    console.log('Todo anda bien en la vida');
  })
  .catch(function(message){
    console.log(message);
  }) */
//Multiples promesas
//.then() cuando se terminen todas las promesas
//.catch cuando se ejecuta el primer error
// .race devuelve los resultados de la promesa que termine primero
  Promise.race([
    getUser,
    getUserFive
  ])
  .then(function(message){
    console.log(message)
  })
  .catch(function(message){
    console.log(message);
  })
//Tiempos
// setInterval() se ejecuta cadda cierto tiempo
// setTimeout() se ejecuta una sola vez despues de un periodo de tiempo

//Ajax

//Una característica muy solicitada en cualquier sitio dinámico es solicitar datos a un servidor, denominado API. Para esto normalmente se utiliza Ajax.

//Ajax recibe dos parámetros los cuales son la 'url' de la API y un 'objeto' donde pondrás la configuración que se usara para realizar la petición. En la configuración se añaden dos funciones para manejar cuando la petición se realizo correctamente y cuando falla.

//jQuery funcion ajax
//Esto de abajo es XMLHttpRequest es para pedir datos de un servicio externo
$.ajax('https://randomuser.me/api/', {
  method: 'GET', //POST, PUT, DELETE
  //Se ejecuta cuando todo sale bien
  success: function(data){
    //data, lo que devuelve la api
    console.log(data);
  },
  //Se ejecuta cuando hay un error
  error: function(error){
    //error: mensaje de error del api
    console.log(error);
  }
})

//Vanilla JS puro
//En JS con la funcion fetch() Vamos a poder traer datos de un sevidor pegarlos
//Recibe dos parametros url, configuracion
//Si no hacemos la configuracion no pasa nada solo va a utilizar los datos por defecto
fetch('https://randomuser.me/api/')
  //Lo primero que hace fetch es devolver una promesa
  //esperamos a que se resuelva
  .then(function(response){
    //console.log(response);
    //mandamos el metodo json
    return response.json();
    //response.json(), tambien devuelve una promesa
  })
  .then(function(user){
    console.log('user', user.results[0].name.first);
  })
  //Si algo falla
  .catch(function(){
    console.log('error algo fallo');
  });

//Funciones asíncronas
//Lo primero que hay que hacer es poner async

(async function load(){
  //como la funcion es asincrona tengo la palabra resevada 'await'
  //await esperar a que termine de consumir la api
  //response va a esperar a que fetch se consuma y luego se va a ejecutar lo que sigue
  //await solo funciona cuando una funcion es asincrona  
  //generos
  //action
  //terror
  //animation

  async function getData(url){
    //esperamos a que se resuelva
    const response = await fetch(url)
    //llamamos al metodo json
    //todo devuelve una promesa
    const data = await response.json();
    if (data.data.movie_count > 0){
      return data;
    }else{
      throw new Error('No se encuentra ningun resultado');
    }
  }

  const $form = document.getElementById('form');
  const $home = document.getElementById('home');
  const $featuringContainer = document.getElementById('featuring');

  function setAttributes($element, attributes){
    for (const attribute in attributes){
      $element.setAttribute(attribute, attributes[attribute]);
    }
  }
  
  const BASE_API = 'https://yts.mx/api/v2/';

  function featuringTemplate(peli){
    return(
      `
      <div class="featuring">
        <div class="featuring-image">
          <img src="${peli.medium_cover_image}" width="70" height="100" alt="">
        </div>
        <div class="featuring-content">
          <p class="featuring-title">Pelicula encontrada</p>
          <p class="featuring-album">${peli.title}</p>
        </div>
      </div>
      `
    );
  }

  $form.addEventListener('submit', async (event) => {
    //debugger
    event.preventDefault();
    $home.classList.add('search-active');
    const $loader = document.createElement('img');
    setAttributes($loader, {
      src: 'src/images/loader.gif',
      height: 50,
      width: 50,
    });
    $featuringContainer.append($loader);

    const data = new FormData($form);
    try {
      const {
        data: {
          movies: pelis
        }
      } = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`)
      const HTMLString = featuringTemplate(pelis[0]);
      $featuringContainer.innerHTML = HTMLString;
    } catch(error){
      alert(error.message);
      $loader.remove();
      $home.classList.remove('search-active');
    }
  });

  //console.log(actionList, dramaList, animationList)

  //Vanilla Js
  function videoItemTemplate(movie, category) {
    return (
      //los templates literals nos permite poner una variable dinamica con ${dato}
      `<div class="primaryPlaylistItem" data-id="${movie.id}" data-category=${category}>
        <div class="primaryPlaylistItem-image">
          <img src="${movie.medium_cover_image}">
        </div>
        <h4 class="primaryPlaylistItem-title">
          ${movie.title}
        </h4>
      </div>`
    )
  }
  function createTemplate(HTMLString){

    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML = HTMLString;
    return html.body.children[0];
  }
  function addEventClick($element){
    $element.addEventListener('click', () => {
      showModal($element);
    })
  }
  function renderMovieList(list, $container, category){
    //actionList.data.movies
    $container.children[0].remove();
    list.forEach((movie) => {
      const HTMLString = videoItemTemplate(movie, category);
      const movieElement = createTemplate(HTMLString);
      $container.append(movieElement);
      const image = movieElement.querySelector('img');
      image.addEventListener('load', () => {
        movieElement.classList.add('fadeIn');
      })
      addEventClick(movieElement);
      //console.log(HTMLString);
    })
  }

  async function cacheExist(category){
    const listName = `${category}List`;
    const cacheList = window.localStorage.getItem('listName');
    if (cacheList){
      return JSON.parse(cacheList);
    }
    const {data: {movies: data } } = await getData(`${BASE_API}list_movies.json?genre=${category}`);
    window.localStorage.setItem(listName, JSON.stringify(data));
    return data;
  }
  
  //const {data: {movies: actionList } } = await getData(`${BASE_API}list_movies.json?genre=action`);
  const actionList = await cacheExist('actionList');
  const $actionContainer = document.querySelector('#action');
  renderMovieList(actionList, $actionContainer, 'action');
  
  const dramaList = await cacheExist('drama');
  //window.localStorage.setItem('dramaList', JSON.stringify(dramaList));
  const $dramaContainer = document.getElementById('drama');
  renderMovieList(dramaList, $dramaContainer, 'drama');

  const animationList = await cacheExist('animation');
  const $animationContainer = document.getElementById('animation');
  renderMovieList(animationList, $animationContainer, 'animation');
  //despues de la respueta del metodo json
  //hacemos el console.log
  /* console.log('Action List: ', actionList.data.movies); */
  //Selectores .home
  //Jquery


  // const $home = $('.home .list #item');
  //$ Porque asi sabesmos que es un elemento del DOM (DocumentObjectModel)
  const $modal = document.getElementById('modal');
  const $overlay = document.getElementById('overlay');
  const $hideModal = document.getElementById('hide-modal');

  const $modalTitle = $modal.querySelector('h1');
  const $modalImage = $modal.querySelector('img');
  const $modalDescription = $modal.querySelector('p');

  function findById(list, id){
    return list.find(movie => movie.id === parseInt(id, 10))
  }

  function findMovie(id, category){
    switch (category){
      case 'action' :{
        return findById(actionList, id);
      }
      case 'drama' :{
        return findById(dramaList, id);
      }
      default: {
        return findById(animationList, id);
      }
    }
  }


  function showModal($element){
    $overlay.classList.add('active');
    $modal.style.animation = 'modalIn .8s forwards';
    const id = $element.dataset.id;
    const category = $element.dataset.category;
    const data = findMovie(id, category);

    $modalTitle.textContent = data.title;
    $modalImage.setAttribute('src', data.medium_cover_image);
    $modalDescription.textContent = data.description_full;
  }

  $hideModal.addEventListener('click', hideModal);

  function hideModal(){
    $overlay.classList.remove('active');
    $modal.style.animation = 'modalOut .8s forwards';
  }

  })();