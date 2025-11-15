type PathRules = {
  pattern: string,
  className: string,
  exact?: boolean,
  hideSideBar?: boolean
}

const pathRules: PathRules[] = [
  /// static paths
  {pattern: '/auth/login', className: 'layout-ghost-login', exact: true, hideSideBar: true},
  {pattern: '/auth/register', className: 'layout-ghost-register', exact: true, hideSideBar: true},

  /// dinamic paths
  {pattern: 'home', className: 'layout-home'}
]

export default pathRules