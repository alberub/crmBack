const getMenu = ( role = 'user_role') => {

    const menu = [
        {
          titulo: 'Dashboard',
          icono: 'mdi mdi-gauge',
          submenu: [
            { titulo: 'Main', url: '/' },
            { titulo: 'ProgressBar', url: 'progress' },
            { titulo: 'Graficas', url: 'graficas' },
            { titulo: 'Promesas', url: 'promesas' },
            { titulo: 'Rxjs', url:'rxjs' }
          ]
        },
    
        {
          titulo: 'Mantenimiento',
          icono: 'mdi mdi-folder-lock-open',
          submenu: [
            // { titulo: 'Usuarios', url: 'usuarios' },
            { titulo: 'Medicos', url: 'medicos' },
            { titulo: 'Hospitales', url: 'hospitales' }
          ]
        }
    
      ];

      if( role === 'admin_role') {
          menu[1].submenu.unshift( { titulo: 'Usuarios', url: 'usuarios' } )
      }

      return menu;

}

module.exports = {
    getMenu
}