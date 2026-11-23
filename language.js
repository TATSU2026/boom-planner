(() => {
  'use strict';
  const { keys, packs, names } = window.plannerLanguages;
  const indices = new Map(keys.map((key, i) => [key, i]));
  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();
  const select = document.getElementById('planner-language');
  const preference = 'elite-planner-language';
  const url = new URL(location.href);
  function supported(value) {
    if (!value) return null;
    if (/^zh(?:-|$)/i.test(value)) return /hant|tw|hk|mo/i.test(value) ? 'zh-Hant' : 'zh';
    if (/^(no|nb)(-|$)/i.test(value)) return 'nb';
    const base = value.toLowerCase().split('-')[0];
    return Object.hasOwn(names, base) ? base : null;
  }
  let saved;
  try { saved = localStorage.getItem(preference); } catch {}
  let current = supported(url.searchParams.get('lang')) || supported(saved)
    || (navigator.languages || [navigator.language]).map(supported).find(Boolean) || 'zh';
  const lookup = text => current === 'zh' ? text : packs[current][indices.get(text)];
  const talents = keys.filter(key => /^[一二三四五]命 · /.test(key));
  const number = value => new Intl.NumberFormat(current, {useGrouping:false}).format(Number(value));
  function translate(text) {
    if (current === 'zh') return text;
    const source = text.trim();
    let result = lookup(source);
    if (result === undefined) {
      let match;
      if ((match = /^合计每月 (\d+) 抽$/.exec(source))) result = lookup('合计每月')+' · '+number(match[1])+' '+lookup('抽');
      else if ((match = /^(\d+)\s*抽$/.exec(source))) result = number(match[1])+' '+lookup('抽');
      else if ((match = /^模拟达成率([\d.]+)%$/.exec(source))) result = lookup('模拟达成率')+' '+new Intl.NumberFormat(current,{style:'percent',maximumFractionDigits:1}).format(Number(match[1])/100);
      else if ((match = /^(目标)?(\d+)命(星徽|（(.+)）)?$/.exec(source))) {
        const level = number(match[2]);
        const prefix = match[1] ? lookup('目标')+' · ' : '';
        if (current === 'zh-Hant') {
          const skill = talents.find(key => key.endsWith(' · '+match[4]));
          const suffix = skill ? lookup(skill).split(' · ').pop() : match[4]==='本体' ? '本體' : '';
          result = prefix+level+'命'+(suffix ? '（'+suffix+'）' : '')+(match[3]==='星徽'?'星徽':'');
        } else {
          result = prefix+(current==='ja' ? level+'凸' : window.plannerLanguages.ranks[current][Number(match[2])]);
        }
      }
    }
    return result === undefined ? text : text.replace(source,()=>result);
  }
  function renderText(node) {
    let source = originalText.get(node);
    if (source === undefined) {source = node.data; originalText.set(node,source);}
    const value = translate(source);
    if (value !== node.data) node.data = value;
  }
  function render(node) {
    if (node.nodeType !== 1 && node.nodeType !== 3) return;
    const parent = node.nodeType === 3 ? node.parentElement : node;
    if (!parent || parent.closest('script,style,textarea,#public-messages,.locale-menu,#planner-language')) return;
    if (node.nodeType === 3) { renderText(node); return; }
    if (node.nodeType !== 1) return;
    for (const attr of ['placeholder','aria-label','alt']) {
      if (!node.hasAttribute(attr)) continue;
      if (!originalAttributes.has(node)) originalAttributes.set(node,{});
      const originals = originalAttributes.get(node);
      originals[attr] ??= node.getAttribute(attr);
      node.setAttribute(attr,translate(originals[attr]));
    }
    for (const child of node.childNodes) render(child);
  }
  function apply() {
    document.documentElement.lang = current === 'zh' ? 'zh-CN' : current;
    document.documentElement.dir = current === 'ar' ? 'rtl' : 'ltr';
    select.value = current;
    activeFlag.src = flags[current];
    activeLabel.textContent = names[current];
    for (const button of list.children) button.setAttribute('aria-pressed',String(button.dataset.code===current));
    select.setAttribute('aria-label',lookup('语言'));
    render(document.body);
    render(document.querySelector('title'));
    for (const link of document.querySelectorAll('a[href]')) {
      const target = new URL(link.href,location.href);
      if (target.origin === location.origin && /\/(?:contact|guestbook|index)\.html$/.test(target.pathname)) {
        target.searchParams.set('lang',current);
        link.href = target.href;
      }
    }
    document.dispatchEvent(new Event('planner-language'));
  }
  for (const [code,label] of Object.entries(names)) select.add(new Option(label,code));
  const flags = {"en": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAoCAMAAABevo0zAAAAM1BMVEX///+6w9fzytGrtc3WTWM3UInxxMvIEC4BIWnAyNqqtc22wNT0ztTs7vT109n88fPO1OI8OV3ZAAABE0lEQVRIx+3XtxaDMAwF0AfBlFD//2tDDbasYnIYMvAGBpd7WJAEihJbWlezeQHVHuDNn3EZumI5MWvrQyNt0Oe2wyppgSEHlIVB6qBrkYdCRhcoqYEcV7smWnRpoItepnE1lg2VlECWq1dQJ3lQ4A5QIzlQ5E5QJmNQ4XxQIimociHIkyFocBTkyN4He4ObwYZm6jEO5Zxh3C95IMKdfoquIyUeeE8ugdXNecAH/AX8/y+FKw5b9hLBgN/iwRWHuHzB79c5LV9kNy5fKtdxBVYnYXBsC9BIGJzQpGQSBie2UYmEwSmNnidhcOoowpEwOGNYiklE3MVxjpCtxSUMnIQ0uKSR2CctLnFoP0mLS/6tOMgPj+pDAxFVOjwAAAAASUVORK5CYII=", "de": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAwAgMAAAD7ixVkAAAACVBMVEUAAADdAAD/zgDGIigcAAAAG0lEQVQoz2NgGAVUBaFYwKgg+YKrsIBRQbIFAbpUPtBQ8ZOVAAAAAElFTkSuQmCC", "es": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA1CAMAAADh9px2AAAA3lBMVEX6vQCtFRnnkwabMRKZPA30tQH4uwGXKhDuswC+OxmrqKnjqQOuAyOcSQZ6bh+2TQ6bXAjFlwrvrQTSpyHnnQWzpXigIBCqoY5EZHlqbkeKVBK6ZCKHLxKoggWrWl/Sr0qUFBe8jKamiSDTnhKfUzLjsh/OWwo8MHOrcA6sKxiRdAmyXUfSZauEf1KvjHjccwvLhg+1rZixCiCjFB9BWGODIA7Zggeynaf5vwtvf2zJfwarbly2GxyyiwSuREt5G02qMkCjgCmvl4dxRwB7XgClO0cQP5Wpdl68fpO9fp8nzyHlAAABfklEQVRYw+3Wx26DQBAG4MVb6RhMM8Vg494r7o5byvu/UC5RTrktUpSI/7aXTzPSzGqAUHBACZZgCf4PsFJwwF9OtVBtyyxNbm+L4nDLauFIlq2WXFC300BfXBUxmFZJIWBPWTiC03ccRS+maxktIUWUOmjPj5m6iIFsDAbGQDNmANT2JifY6+HKxkAhzXpXyyKzqMUHsijCupKslaEkTdwbO0W8A2nbRFfu92T4no5SlzXsNp9H5jbRk8djPcxHo9xlDYkT3JxfxL6iackwl0apKwh9EXMtyTF+24jrgZZ0L+lH6naCuN/hqlC8HTr6Mgy7q1Us5W5NlPgqBDhWpnVKw+7q1TFUVFs8+caGiOcJqUMIl90LRQiyRnyscYmduU3qEEIEVUNTEWtIAeYemy9QrSNkco+N3Gwyg0KIMlWAKsKnJuemjH2/aYYUoskTITizfM3nA33PGwM5yMa73SGrgKrnedyfLAEAYGYy/P36zRR+OZTnXAmWYAn+lE9C+ywNWkwjFAAAAABJRU5ErkJggg==", "fr": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA1BAMAAAAkBnF3AAAAD1BMVEX///8AJlTOESbeYG5Wb42QNrxKAAAAJ0lEQVRIx2MQRAYODEiAWQkZMIwqHFU4qnBU4ajCUYWjCkcVUkEhAIQklyN0REMMAAAAAElFTkSuQmCC", "it": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA1BAMAAAAkBnF3AAAAD1BMVEXOKzcAkkb///9VtoPecHj7ZEZ0AAAAJklEQVRIx2MQRAZGSkhAhQEFjCocVTiqcFThqMJRhaMKRxVSQSEA6aGUCJuKIGMAAAAASUVORK5CYII=", "ja": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA1CAMAAADh9px2AAAAOVBMVEW8AC3ILFHUW3jbdY3DG0PghpvmoLH////kl6n55ur22uC/Czb+/Pzxy9TKNlntu8fPSWnrsb7MP2AZmjhmAAAA40lEQVRYw+3Wyw6EIAwF0PK0vETn/z92Nm6M0rGFZBZy1+SEQCgXlsGBCU7wtWDcvXN+j2PA4BQcUS50g1HDKTr2gR4uwR7QwU2cHNRwGyMFPTSCMrBAM0UCZtsGbRaAHoh4AbhS4MoHI5AJbNDRILLBjQY1G1xp8MMGLQ1aLpjhR/K/d7goGlSjb3ljg4YGHRssNBj5b1mJjpAAUfTyqHlIbHHNoomdWl4qg/8UL/31zOBfr3Ex2NMc6uUcU+3rNsGcyGR+1aUH7Qv1MXmsxv72daAVsYZHS5822DxL+wRfDX4B50xfz1QVWiYAAAAASUVORK5CYII=", "zh": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA1CAMAAADh9px2AAAANlBMVEXuHCX//wDwLyHyVBvuIiP5qw3xPx71dRX+5wP3jRL4mRD/9gHzXxnySxz7wQn6tgv7ygj80QdOKUmjAAAAwElEQVQYGe3BSXLDMAwEwBkQBFct+f9nbSVOpORIwYdUsRv/msKTmBS42lvEbYZTZKuKe2TFDytrwl2JgpME3LUy4TcxKIYpueKPHAsGaDgUsoXDghepjQtG9MbTh+FFLcaqGCE7v1VcFMUYReGnHHClGLfxkOBFGw8RXjqZK9kUV0EwKnJTWGbHSUKsQTBEc8KTxoiLQhaMMcOXjgvL2eBpEQlws8CTpFThKnLvcCSZ2wJHoj3BmWCapmmapumtHrOgA8RDdxj4AAAAAElFTkSuQmCC", "zh-Hant": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA1CAMAAADh9px2AAAANlBMVEXuHCX//wDwLyHyVBvuIiP5qw3xPx71dRX+5wP3jRL4mRD/9gHzXxnySxz7wQn6tgv7ygj80QdOKUmjAAAAwElEQVQYGe3BSXLDMAwEwBkQBFct+f9nbSVOpORIwYdUsRv/msKTmBS42lvEbYZTZKuKe2TFDytrwl2JgpME3LUy4TcxKIYpueKPHAsGaDgUsoXDghepjQtG9MbTh+FFLcaqGCE7v1VcFMUYReGnHHClGLfxkOBFGw8RXjqZK9kUV0EwKnJTWGbHSUKsQTBEc8KTxoiLQhaMMcOXjgvL2eBpEQlws8CTpFThKnLvcCSZ2wJHoj3BmWCapmmapumtHrOgA8RDdxj4AAAAAElFTkSuQmCC", "ko": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA1CAMAAADh9px2AAAA3lBMVEX///8AR6DNLjoAAADt7e0UFBQODg7p6em3t7fz8vP5+PhXV1egoKBOTk6np6caGhqamppCQkKRkZG8vLzj4+M7OzsJCQm0MEYRRJfAMUNcXFxkZGTHx8evr69xcXGzs7O6y+TRPUjonqRyOWgRU6bV1dVJSUk1NTVtlsnihY2lvt79/P0cRJL0zdDvub4sLCxfX19Gerrca3SQrtZfO3DV4O/XWGGCpNA3QITUcX1cicL21tlUhL/ki5KlMk6/v7+9r8UhX6xxb5+TNVf55edCPn8nTpi2cYnVo7HMzMwEGb/sAAACqUlEQVRYw+2XaXOiQBCGgR5uDUQELxCjxgtjvHJnk72P//+HdoaIjgrMSKVqa6vSVX4Q22d46aH7HUH4iP8imhW+vIrJl3cG4PDkaQBnPHmqDGXDZSId1yiDrHIAcRpqg4dQXhJSPWgjvDSbVwIIfICKppSyk2xFqwD4WHSJxasqYOoWuLoM59lZ51jFECyjeX3JApLUFnjVJijV/GWrAC2dWWkbQHOIYIYY8mCw6FeHUemqB3MiGD/uAXX5qjteLsfdmbFXOsEFSzdBUXMFWzoRXKbS9PGFtImL7hapDn2El28ha2/pY8EOFmufUUK6W1yMnO1UK1qSnwm8vG6R6qq7/aUvpYMYR5ufBmAhomg+zKu0PsfVpQTfSkfxQFfaI5XOf0HlEhYcbL59klKiu3vnA1vWWBsRGTIke+tJSo0rqtKI42X23STrVzrwNqm065/UFqNOQ8q/xVPjawZPGhcE/jwEfev1XuLdWIx3I9ZoWmNdF3H8IBe/FwJ2xDXFq03Ft6jXij7EiSi+HPMwsSHNigLriehaXdxFryDwhtxNj2ydRo/miVPpqVhV+vHf79f34kE0omLARzEjHgruw0kW8PdpHH+4eZejL+m86aZvo+EfDhzdbTrpwM+ndJsg7ofJABil8e6oyVdi9UMdz2OV8izPx7znpHnhjo0/zbyOjWcKHqAmNUSjo3t8jChLYIKsz3PcA5liWHAYUFNv0qdx/RU19cIQ54V5Uy+ey3jlvfFtrLbI/kin5zK2BOX8uUwm2byqtNV9o2Z0VqPFYnHX2Td9gtpWVIZzIJULUSDbAYe3sa0QOUwXSwRzui+Px32R1CafPyRWicMfEjFvhi7fwYbEzIUcDvZEjz3gOQUQU+wyHUZ8ClB4TgHvfk4RBPOdT1If8a/jL1S9MUKKtUGPAAAAAElFTkSuQmCC", "nl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA1BAMAAAAkBnF3AAAAD1BMVEWuHCj///8hRovIZm5rhLLyO+d3AAAAK0lEQVRIx2NgGAWjYCgCYyIBgyCRYFThqMJBpdCFSMCgRCQYVTiqcDApBADNaJoRWwlNAgAAAABJRU5ErkJggg==", "nb": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6BAMAAADVUMOiAAAAIVBMVEUAIFu6DC/////MSWNBWYV/j6x0haXTZHrGN1T//v7ei5sR6cc6AAAAWklEQVRIx2MQhAMJJTUGBgYnpUJBbIBhVOGowlGFpCk0hgNzqMLFxtgAgxISgCjECjRpoDAUCYQAFbKGYgcMIxO4IAEHIJ/FBTsYyCgkOpmNZtdRhaMKaaMQAO8ZzJXM+UJqAAAAAElFTkSuQmCC", "pt": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA1CAMAAADh9px2AAAA+VBMVEX/AAAAZgD////8AAABYgDY1wD3AQDf3gD6+vvR0QLpBABbfL7BxgCwvgCZsADZfADueXd5nwJslgCSqQCiuADv7gAAXADIzQDyGQ/zOjfdZVDWvAA4fQDn5wDBYgDvgX/vTkvJUgDeXUHTjwC/hADOggisvN7mOAHdUALXpgDUxQDBrwPMdQDTmgDrXFdzj8eEogDZhwDUZgDZbQDZrwC5iVS5ewDdgldViQDfXwDG0eiVqtXsamX8/ADcIgCii1neeWLRoQDMjlTLwgD//wC3ngDXnHzb4vDst7XrpqPi6PTTqljfxlmmtWbKtFIYbACDfUWaeVTIRABJHBxHAAACP0lEQVRYw+3WV5PaMBAAYIEsyXKv2NjY2Mamdwh3cNxxhevp///HRE6YvGYieEhm2NHo8Zu1tdIuqPwhwN/GGTyDZ/BfBAV8QlCoWJb9uFhL8CSgYKmIUOUhRLS3xseDlwpRp42a1pIkPSTLzrGgHakNgaWptVhycN0ni+NAJ9p9+1DG/f0FiyC4j2ZHgILlqVmcYghxHJd7GgcDGvODNvG0LM/Z4eI8Lz85z4PhgxJDTrCGrvduNpz79Xq9KNjmzxfZ99wbSHygYFEPRWMAmuIhDADGo1mP3HBmqCHkKgkDq9WqLIvVaglKQEI6Z4aeZnpRAg9g9QBCuOxhLvALmlqOl6XdEmy3S7CbBuGdPupLXOAlpaptZqtVs331dsVW21itguEoROiGC5wqdq0mZEXRnEw2sryRJ0ZRBBhLd96KL0OkUGeaQNhsy+JkIsptA8LxsBX2vZTvUIhmaSorG4P9vs2GbVsAti19MUIS5yk7QkUIAEgOZSPWAbjo+XgZYt46rFWEHfQ7L7/K5rXj44/XYYfMOAu7EdkOpfX5UH8Rn5/FV304TwbXe4o6vHdZQZ5jfk3vdJgYRgL0UcoSdPe8d7lSMani2Je73wl1b1sDqrgx/wNru6pC0Oetzx4s6G/f+4g+RI+QHxQcV2uYpvnp6fb26b3QF92eO4NH9RQzUsqeUrNbrInC7pLMj+16DZU45s+u5+tLMro5UV9GSr9PUK+LTzM5CNZUHehrCZ9ytoEnnG3OA+cZPIP/D/gDi5JASRpy9TcAAAAASUVORK5CYII=", "ru": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA1BAMAAAAkBnF3AAAAD1BMVEXVKx4AOab///+OMEuqveHhfiP9AAAAKUlEQVRIx2NUYiAOMDGMKhxVOHgUshCbcBkFR8NxVOFwTuGjYBQMSQAASsMAwmh8IyAAAAAASUVORK5CYII=", "tr": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA1CAMAAADh9px2AAAASFBMVEXjChfoLDf3trrlFCH1oabpN0L+8fH////mHyvsUVr85ebrSlTwcXjxho32q6/72tztXGXzlZv4wcTykJX++PnqRE7weoH6z9HJeFUyAAAA7ElEQVRYw+2W2RKDIAxFAZFFFhG3///TjmBb21JHIY/cF2dk5pjchESEqqqqqq5LuIUSaxQQThK+ayJtOa6x/CiCC3m4jyBmFyUQVrQrS1x0kUfFK+JRlvBifP2Hda3IB0b/ui9Ck81rY76p0uIsKg28IdlLNAfIAjBpmeRue9wruQw8/+eMYUmZvgU0AWhOPkZyLNRJB1mq/Neaxv28V3u3c32zJgN0hMuJh3OOhzN0lcH7EP6mgN9lNAJPG9SsgbiCzcPnhJ3evVM2sQ87xRsZd4orXXsGduttaQ8T5F4OSG29h/tzqKqqqnoAliYK+q/+x14AAAAASUVORK5CYII=", "ar": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA1CAMAAADh9px2AAAAVFBMVEUAVDAeaEh2o4+KsJ8OXTs5el4IWTZ+qZZAf2QWYkFLhmxXjncnbk9tnYgvc1ZFgmhglH5QinG/1Muxy7+jwbSYuqyRtaYDVjOErZvg6ubT4dv7/PwhsBJvAAABnUlEQVQYGe3BSW7dMBAFwMex2ZxHifq+/z2DLLIzEDrIUlV4vV6vczYi3iJqNgxjNWe+G8qwQmYho42arZBR45hpNdaZ9vZ0e5+qS25Ib8RkR5raDJOHKBdOacMDhlJZJhhQiYJwmX5DxUgIRu+NjShxysBXWCmbEqloFa0ZKK4qUGaVnctxgqwmnDIsyRf5WesmpfLYe/URqycSuKqpxfZK2144dXdfR4LrAuSCCE3cRlujzafkS2gp7RW6dRdO2V4lxMzbJDJZKjPYm7ieKNetLAhQmIEvHMuSea/nqeqh7l1VJufdyddwpczUorr3ihdO5eRl025L1gsRmDm1ZW7bgi8UPCFKljw3TomkC2xy1SOB7nZh9t4/X0+rOlkeVgdb2Uuccm3QnGFlxQ2lTy1Ji74cEEoDbXJVBwuPUzxkyeoSkLr1yaa3PC7GnRA+tmhXqFQjlsAx1wcxAgsf9HhGDFasT2s5+bKSkRoiyKTxUw5/WAAi4rcItni9Xn9jA/5Npe+pDxF5/By77z001dcX/h8PAWHwer1eP/ILL3kYDinfdx8AAAAASUVORK5CYII=", "id": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA1AgMAAACrRoTXAAAACVBMVEX/AAD/////f3/sDLJDAAAAG0lEQVQ4y2NgGAWjAC9YhQUwhGIBo4KjgnAAAA8AufGM9Lq4AAAAAElFTkSuQmCC", "ms": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAoCAMAAABevo0zAAAAPFBMVEUAAGYzAE0XElzywQXYPz/yv7//zADMAAD////lf39NPUbBmhh1XTbTqBE5LU8qIlWTdiphTj5/ZTOqiCG9Hr0CAAABDUlEQVRIx9WVzW7EIAyEXXt3tmtM+Mn7v2tPASJFFSFslc6Ji0c232CIOvXqFH3ccOFjw0en9lW6CvxqR57fndrZCXxiIppkGIG4nQOFQKE1fHaqVqTGjzKpUr4EhQV+OyppNotKyuOGBmgh7RZxTha31A7fnSoFK2RrkEkhgECJeRhKnZiS9wIA4l0apsyAq/NlAABaKqdHrh0Gc6XDmvHTUFy5Q6J6hxdiE4H0G+XTwQ6AcMlhMrOc2hyef3rWYjFSJbv+lv3WEVMI+x0xsr4MwKp8vG2GFmzIDhAf+S++gJEFO8fwq1PdOXxN1nzDx2R1X3Y3lOmG78n6B5Snj3x/ytODfX/Kz8m6P+UfevBF/xzUcWoAAAAASUVORK5CYII=", "vi": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA1BAMAAAAkBnF3AAAALVBMVEX/AAD/6wD/dgD/BwD/LgD/swD/2wD/ywD/lAD/GQD/TAD/ggD/QQD/5AD/aABQeZ7QAAAA3UlEQVQYGe3BMUoDQRiG4RdHTIyy8Im7BjEgOcEUdiLEKoXVlnZubxEhB0hKuzT28QaKF9DGPniBPYrJEILNzvytsM9D6x9xHpveEpvuDJubH2xez7GZ9zFxVeGxOJY+sehKMywOpAcsvqQL4rLhRinlw42aJoel/sgXNMpW2hnUNHNj7UyJcXNt9T1RvUpBsSTOvSi4J8VXWitIulIwIuVIwRspHQUTUm6lvJROSXmXPq6lE1Ke9AjfOiNhX/kCXKkRcXuDmrVsdUlcZ0ownhB35wncM3GeLUerlfALhNEipD22nCoAAAAASUVORK5CYII=", "th": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA1BAMAAAAkBnF3AAAAD1BMVEWlGTEtKkr09fiyP1Oysr55zkMlAAAANUlEQVRIx2NgGAVUAcZEAgYlIsGoQvwKXYgEDIJEglGFowoHlUKiU/hoSUEdhUSX4aOAKgAAbROnWeiw6CoAAAAASUVORK5CYII=", "fi": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAxBAMAAAC/lzNhAAAAD1BMVEUAL2z///+/yto4XIxviqwRGMjzAAAAMklEQVQ4y2MQRAADBhBgEcQKGEYVjiocTAqVEACqUAkrYBgFowADEJ16RnPhqMKhqBAAZ9pal1I6oX4AAAAASUVORK5CYII="};
  const menu = document.createElement('details');
  menu.className = 'locale-menu';
  const trigger = document.createElement('summary');
  const activeFlag = document.createElement('img');
  activeFlag.alt = '';
  const activeLabel = document.createElement('span');
  trigger.append(activeFlag,activeLabel);
  const list = document.createElement('section');
  menu.append(trigger,list);
  select.hidden = true;
  select.after(menu);
  for (const [code,label] of Object.entries(names)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.code = code;
    const flag = document.createElement('img');
    flag.alt = '';
    flag.src = flags[code];
    button.append(flag,label);
    button.onclick = () => {select.value=code;select.onchange();menu.open=false;trigger.focus();};
    list.append(button);
  }
  menu.addEventListener('keydown',event=>{if(event.key==='Escape'){menu.open=false;trigger.focus();}});
  document.addEventListener('click',event=>{if(!menu.contains(event.target))menu.open=false;});
  window.plannerLocale = {translate,get language(){return current;}};
  select.onchange = () => {
    current = select.value;
    try {localStorage.setItem(preference,current);} catch {}
    try {const next=new URL(location.href);next.searchParams.set('lang',current);history.replaceState(null,'',next);} catch {}
    apply();
  };
  apply();
  new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) render(node);
  }).observe(document.body,{subtree:true,childList:true});
})();

