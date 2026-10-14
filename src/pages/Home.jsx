import { About } from '../components/About'
import { Certifications } from '../components/Certifications'
import { Contact } from '../components/Contact'
import { Education } from '../components/Education'
import { Experience } from '../components/Experience'
import { Hero } from '../components/Hero'
import { LearningJourney } from '../components/LearningJourney'
import { Projects } from '../components/Projects'
import { Skills } from '../components/Skills'

export function Home() { return <main><Hero /><About /><Skills /><Projects /><Experience /><Education /><Certifications /><LearningJourney /><Contact /></main> }