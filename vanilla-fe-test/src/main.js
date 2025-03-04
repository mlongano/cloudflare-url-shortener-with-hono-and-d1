console.log( 'Hello World' );

document.addEventListener( 'DOMContentLoaded', function () {
  console.log( 'DOM fully loaded and parsed' );
  const res = fetch( 'http://localhost:8787/api/v1/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        {
          email: "Eldora.Crooks38@hotmail.com",
          password: "this-is-a-very-secure-password"
        }
      )
    })
    .then( response => response.json() )
    .then( data => console.log( data ) )
    .catch( error => console.error( error ) );
  console.log( res );
});