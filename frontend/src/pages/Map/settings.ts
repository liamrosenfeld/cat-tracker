/*
  Configuration of the google map goes here

  LINK TO DOCUMENTATION
  https://react-google-maps-api-docs.netlify.app/#googlemap
*/
import mapStylesheet from './mapStylesheet';

// functions

// variables

export const mapContainerStyle = 
{
  width: '100%',
  height: '100vh'
};

// GNV coordinates
export const center = 
{
  lat: 29.645,
  lng: -82.35
};

// Starting zoom
export const zoom = 15;

// Extra Options
export const options = 
{
  styles: mapStylesheet,
  disableDefaultUI: true,
  zoomControl: true
};