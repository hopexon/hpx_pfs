import style from "@/app/tools/dpis-calculator/dpi.module.css";

export default function DpiCheetSheet() {
  return (
    <>
      <h2 className={style.calculator__ttl}>Cheet Sheet</h2>
      <div className={style.cheetsheet__note__wrapper}>
        <p className={`${style.cheetsheet__note__item} ${style.note__ttl}`}>- note -</p>
        <p className={style.cheetsheet__note__item}>every pixel size aren't contain extra 3mm size.</p>
      </div>
      <table className={style.table__dpicheet} cellSpacing="0" cellPadding="6">
        <thead>
          <tr>
        <th className={style.dpicheet__th}>size</th>
        <th className={style.dpicheet__th}>mm</th>
        <th className={style.dpicheet__th}>mm + 3mm</th>
        <th className={style.dpicheet__th}>350dpi</th>
        <th className={style.dpicheet__th}>300dpi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
        <td className={`${style.cell__A} ${style.size}`}>A0</td>
        <td className={style.cell__A}>841 &times; 1189</td>
        <td className={style.cell__A}>847 &times; 1195</td>
        <td className={style.cell__A}>11589 &times; 16384</td>
        <td className={style.cell__A}>9933 &times; 14043</td>
          </tr>
          <tr>
        <td className={`${style.cell__A} ${style.size}`}>A1</td>
        <td className={style.cell__A}>594 &times; 841</td>
        <td className={style.cell__A}>600 &times; 847</td>
        <td className={style.cell__A}>8185 &times; 11589</td>
        <td className={style.cell__A}>7016 &times; 9933</td>
          </tr>
          <tr>
        <td className={`${style.cell__A} ${style.size}`}>A2</td>
        <td className={style.cell__A}>420 &times; 594</td>
        <td className={style.cell__A}>426 &times; 600</td>
        <td className={style.cell__A}>5787 &times; 8185</td>
        <td className={style.cell__A}>4961 &times; 7016</td>
          </tr>
          <tr>
        <td className={`${style.cell__A} ${style.size}`}>A3</td>
        <td className={style.cell__A}>297 &times; 420</td>
        <td className={style.cell__A}>303 &times; 426</td>
        <td className={style.cell__A}>4093 &times; 5787</td>
        <td className={style.cell__A}>3508 &times; 4961</td>
          </tr>
          <tr>
        <td className={`${style.cell__A} ${style.size}`}>A4</td>
        <td className={style.cell__A}>210 &times; 297</td>
        <td className={style.cell__A}>216 &times; 303</td>
        <td className={style.cell__A}>2894 &times; 4093</td>
        <td className={style.cell__A}>2480 &times; 3508</td>
          </tr>
          <tr>
        <td className={`${style.cell__A} ${style.size}`}>A5</td>
        <td className={style.cell__A}>148 &times; 210</td>
        <td className={style.cell__A}>154 &times; 216</td>
        <td className={style.cell__A}>2039 &times; 2894</td>
        <td className={style.cell__A}>1748 &times; 2480</td>
          </tr>
          <tr>
        <td className={`${style.cell__A} ${style.size}`}>A6</td>
        <td className={style.cell__A}>105 &times; 148</td>
        <td className={style.cell__A}>111 &times; 154</td>
        <td className={style.cell__A}>1447 &times; 2039</td>
        <td className={style.cell__A}>1240 &times; 1748</td>
          </tr>
          <tr>
        <td className={`${style.cell__A} ${style.size}`}>A7</td>
        <td className={style.cell__A}>74 &times; 105</td>
        <td className={style.cell__A}>80 &times; 111</td>
        <td className={style.cell__A}>1020 &times; 1447</td>
        <td className={style.cell__A}>874 &times; 1240</td>
          </tr>
          <tr>
        <td className={`${style.cell__B} ${style.size}`}>B0</td>
        <td className={style.cell__B}>1030 &times; 1456</td>
        <td className={style.cell__B}>1036 &times; 1462</td>
        <td className={style.cell__B}>14193 &times; 20063</td>
        <td className={style.cell__B}>12165 &times; 17197</td>
          </tr>
          <tr>
        <td className={`${style.cell__B} ${style.size}`}>B1</td>
        <td className={style.cell__B}>728 &times; 1,030</td>
        <td className={style.cell__B}>734 &times; 1036</td>
        <td className={style.cell__B}>10031 &times; 14193</td>
        <td className={style.cell__B}>8598 &times; 12165</td>
          </tr>
          <tr>
        <td className={`${style.cell__B} ${style.size}`}>B2</td>
        <td className={style.cell__B}>515 &times; 728</td>
        <td className={style.cell__B}>521 &times; 734</td>
        <td className={style.cell__B}>7096 &times; 10031</td>
        <td className={style.cell__B}>6083 &times; 8598</td>
          </tr>
          <tr>
        <td className={`${style.cell__B} ${style.size}`}>B3</td>
        <td className={style.cell__B}>364 &times; 515</td>
        <td className={style.cell__B}>370 &times; 521</td>
        <td className={style.cell__B}>5016 &times; 7096</td>
        <td className={style.cell__B}>4299 &times; 6083</td>
          </tr>
          <tr>
        <td className={`${style.cell__B} ${style.size}`}>B4</td>
        <td className={style.cell__B}>257 &times; 364</td>
        <td className={style.cell__B}>263 &times; 370</td>
        <td className={style.cell__B}>3541 &times; 5016</td>
        <td className={style.cell__B}>3035 &times; 4299</td>
          </tr>
          <tr>
        <td className={`${style.cell__B} ${style.size}`}>B5</td>
        <td className={style.cell__B}>182 &times; 257</td>
        <td className={style.cell__B}>188 &times; 263</td>
        <td className={style.cell__B}>2508 &times; 3541</td>
        <td className={style.cell__B}>2150 &times; 3035</td>
          </tr>
          <tr>
        <td className={`${style.cell__B} ${style.size}`}>B6</td>
        <td className={style.cell__B}>128 &times; 182</td>
        <td className={style.cell__B}>134 &times; 188</td>
        <td className={style.cell__B}>1764 &times; 2508</td>
        <td className={style.cell__B}>1512 &times; 2150</td>
          </tr>
          <tr>
        <td className={`${style.cell__B} ${style.size}`}>B7</td>
        <td className={style.cell__B}>91 &times; 128</td>
        <td className={style.cell__B}>97 &times; 134</td>
        <td className={style.cell__B}>1254 &times; 1764</td>
        <td className={style.cell__B}>1075 &times; 1512</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
