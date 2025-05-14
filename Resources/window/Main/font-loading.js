const loadAllWebFonts = function(){
  return new Promise((resolve, reject) => {
    const loadFontList = [
      { name: "JPAGothic", url: "../common/fonts/jpag.woff2" },
      { name: "JPAPGothic", url: "../common/fonts/jpagp.woff2" },
      { name: "JPAexGothic", url: "../common/fonts/jpaexg.woff2" },
      { name: "JPAMincho", url: "../common/fonts/jpam.woff2" },
      { name: "JPAPMincho", url: "../common/fonts/jpamp.woff2" },
      { name: "JPAexMincho", url: "../common/fonts/jpaexm.woff2" },
      { name: "7barSP", url: "../common/fonts/7barSP.woff2" },
      { name: "NotoSansJP-400", url: "../common/fonts/noto-sans-jp-v42-latin_japanese-regular.woff2" }
    ];
    let loadedFontsCount = 0;
    const allFontsCount = loadFontList.length;
    const OnLoadFonts = target => {
      loadedFontsCount++;
      let familyName = target.family;
      document.fonts.add(target);
      console.info("フォントを読み込みました。", familyName);
      refreshLoadingState("フォントを読み込み中（"+loadedFontsCount+"/"+allFontsCount+"）", target.url);
      // if(familyName === "JPAPGothic") ; // window.Routines.md0title();
      if(loadedFontsCount === allFontsCount){
        console.info("フォントの読み込みが正常に完了しました。");
        resolve();
      }
    };
    const OnLoadError = (target) => {
      console.error("フォントの読み込み中に予期せぬエラーが発生しました。", target.family);
      reject({ type: "load_error", target: target.family });
    };
    refreshLoadingState("フォントを読み込み中（0/"+allFontsCount+"）", "");
    for(let font of loadFontList){
      let fontface = new FontFace(font.name, "url("+font.url+")");
      fontface.url = font.url;
      fontface.load().then(OnLoadFonts).catch(OnLoadError);
    }
  });
};

/*
  JPA Font - The IPA Font Derived Program
    https://jpafonts.osdn.jp
  Licensed under the IPA Font License Agreement v1.0
    https://ipafont.ipa.go.jp/ipa_font_license_v1.html
*/
/*
  About 7barSP
  Created by とろ庵
  Contact to http://www.trojanbear.net
*/
