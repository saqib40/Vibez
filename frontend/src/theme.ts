const theme = {
  colors: {
    backgroundPrimary: '#36393f',
    backgroundSecondary: '#2f3136',
    backgroundTertiary: '#202225',
    interactive: '#40444b',
    interactiveHover: '#4f545c',
    primary: '#7289da',
    primaryHover: '#677bc4',
    textNormal: '#dcddde',
    textMuted: '#72767d',
    textLink: '#00b0f4',
    inputBackground: '#202225', // Corrected: Reverted to the original darker color
    success: '#43b581',
    danger: '#f04747',
    spotifyGreen: '#1DB954', // Added for the new component
  },
  shadows: {
    card: '0 8px 16px rgba(0, 0, 0, 0.24)',
  },
  borderRadius: {
    card: '8px',
    button: '5px',
    input: '3px', // Corrected: Reverted to original value
  },
};

export default theme;