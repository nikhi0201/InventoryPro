import React from 'react';
import '../index.css'; // ensures galaxy CSS loads

export default function GalaxyBackground(){
  return (
    <div className="galaxy-root" aria-hidden="true">
      <div className="galaxy-stars-small" />
      <div className="galaxy-nebula" />
      <div className="galaxy-stars-large" />
      <div className="galaxy-ring" />
      <div className="galaxy-comet" />
      <div className="galaxy-vignette" />
    </div>
  );
}
