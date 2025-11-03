module.exports = {
  plugins: [
    require('tailwindcss'),
    require('postcss-functions')({
      functions: {
        spacing: function(value) {
          // Map spacing values to their corresponding CSS variables
          const spacingMap = {
            '1': '0.25rem',
            '2': '0.5rem',
            '3': '0.75rem',
            '4': '1rem',
            '5': '1.25rem',
            '6': '1.5rem',
            '8': '2rem',
            '10': '2.5rem',
            '12': '3rem',
            '16': '4rem',
            '20': '5rem',
            '24': '6rem',
            '32': '8rem',
            '40': '10rem',
            '48': '12rem',
            '56': '14rem',
            '64': '16rem',
          };
          
          // Remove any non-digit characters and get the spacing value
          const spacingValue = value.replace(/[^0-9]/g, '');
          return spacingMap[spacingValue] || '1rem';
        }
      }
    }),
    require('autoprefixer'),
  ],
};
