import React from 'react'
import Preprocessing from './Preprocessing'
import Normalisasi from './Normalisasi'
import SplitData from './SplitData'
import HasilPrediksi from './HasilPrediksi'
import Evaluasi from './Evaluasi'
import Grafik from './Grafik'

const Proses = ({result}) => {
  return (
    <div className='w-full  grid-cols-1 lg:grid-cols-2'>
      <div className='w-full py-6'>
        <Preprocessing result={result}/>
      </div>
      <div className='w-full py-6'>
        <Normalisasi result={result}/>
      </div>
      <div className='w-full py-6'>
        <SplitData result={result}/>
      </div>
      <div className='w-full py-6'>
        <HasilPrediksi result={result}/>
      </div>
      <div className='w-full py-6'>
        <Evaluasi result={result}/>
      </div>
      <div className='w-full py-6'>
        <Grafik result={result}/>
      </div>
    </div>
  )
}

export default Proses
