console.log( 'Profile page' );

// Add a callback function to render the user's profile information fetched from the server
// The function should be called `renderProfile`
// The function should take a single argument `user` which is an object containing the user's profile information
// The function should render the user's profile information to the page
// The function should be called in the fetch promise chain after the user's profile information is fetched
// The function should be defined in this file

function renderProfile ( user ) {
  const profile = document.getElementById( 'profile' );
  profile.innerHTML = `
    <h1>${ user.name }</h1>
    <p>${ user.email }</p>
  `;
}


document.addEventListener( 'DOMContentLoaded', function () {
  console.log( 'DOM fully loaded and parsed' );
  const root = document.getElementById( 'root' );
  const profile = document.createElement( 'div' );
  profile.id = 'profile';
  root.appendChild( profile );

  const res = fetch( 'http://localhost:8787/api/v1/users/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then( response => response.json() )
    .then( data => console.log( data ) )
    .catch( error => console.error( error ) );
  console.log( res );
});