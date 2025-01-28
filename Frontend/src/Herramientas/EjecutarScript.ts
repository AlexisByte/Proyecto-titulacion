import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class EjecutarScript {



async CargarScriptLogin(){
  await this.loadScript("/assets/vendor/aos/aos.js");
  await this.loadScript("/assets/vendor/glightbox/js/glightbox.min.js");
  await this.loadScript("/assets/vendor/isotope-layout/isotope.pkgd.min.js");
  await this.loadScript("/assets/vendor/swiper/swiper-bundle.min.js");
  await this.loadScript("/assets/js/main.js");
}

  BloquearBotones() {
    this.loadScript("/assets/js/bloquear.js");
  }
  
  
  public loadScript(scriptUrl: string) {
    return new Promise((resolve, reject) => {
      const scriptElement = document.createElement('script')
      scriptElement.src = scriptUrl
      scriptElement.onload = resolve
      document.body.appendChild(scriptElement)
    })
  }


}
