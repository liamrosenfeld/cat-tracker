
/*
  JSON stylesheet for the goole map

  LINK TO DOCUMENTATION
  https://developers.google.com/maps/documentation/javascript/style-reference
*/
const mapStylesheet = 
[
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off'
      }
    ]
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off'
      }
    ]
  },
  {
    featureType: 'transit',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off'
      }
    ]
  },
  {
    featureType: 'water',
    elementType: 'all',
    stylers: [
      {
        color: '#0091c7'
      },
      {
        visibility: 'on'
      }
    ]
  }
];

export default mapStylesheet;