// Test simple de l'API
console.log('Test de l\'API radGPT');

// Test d'authentification
fetch('http://localhost:8000/auth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: 'username=admin&password=admin123'
})
.then(response => response.json())
.then(data => {
  console.log('Token obtenu:', data.access_token ? 'Succès' : 'Échec');
  
  if (data.access_token) {
    // Test de récupération patient
    return fetch('http://localhost:8000/patients/123456', {
      headers: {
        'Authorization': `Bearer ${data.access_token}`
      }
    });
  }
})
.then(response => response?.json())
.then(patient => {
  if (patient) {
    console.log('Patient récupéré:', patient.first_name, patient.last_name);
  }
})
.catch(error => {
  console.error('Erreur:', error);
});
