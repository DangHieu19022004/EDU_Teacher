
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import Content from './Content';
import { StatusBar } from 'expo-status-bar';

//component support view dont want view hide in taskbar

const AppGradient = ({children, colors} : {children:any; colors: string[]}) => {
  return (
    <LinearGradient
        colors={colors}
        className='flex-1'
    >
      <Content>{children}</Content>
      <StatusBar 
        style="light" 
      />

    </LinearGradient>
  )
}

export default AppGradient