import React, {useState, useEffect, useCallback} from 'react'
import ReactDOM from 'react-dom'
//import * as d3 from "d3";
import "./frontend.scss"

const divsToUpdate = document.querySelectorAll(".loan-simulator-update-me")

divsToUpdate.forEach(function(div) {
    const data = JSON.parse(div.querySelector("pre").innerHTML)
    ReactDOM.render(<Quiz {...data}/>, div)
    div.classList.remove("loan-simulator-update-me")
})

function Quiz(props) {
    const [isCorrect, setIsCorrect] = useState(undefined)
    const [isCorrectDelayed, setIsCorrectDelayed] = useState(undefined)

    useEffect(() => {
        if (isCorrect === false) {
            setTimeout(() => {
                setIsCorrect(undefined)
            }, 2600)
        }

        if (isCorrect === true) {
            setTimeout(() => {
                setIsCorrectDelayed(true)
            }, 1000)
        }
    }, [isCorrect])

    function handleAnswer(index) {
        if (index == props.correctAnswer) {
            setIsCorrect(true)
        } else {
            setIsCorrect(false)
        }
    }

    const msg = "some message"

    const myFunc = useCallback(() => {
        console.log(msg)
        const data = [12, 5, 6, 6, 9, 10];
        const svg = d3.select(".loan-simulator-frontend").append("svg").attr("width", 700).attr("height", 300);
        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", (d, i) => i * 70)
            .attr("y", 0)
            .attr("width", 65)
            .attr("height", (d, i) => d)
            .attr("fill", "green");
      }, [msg])

      useEffect(() => {
        myFunc()
      }, [myFunc])

    return (
        <div className="loan-simulator-frontend">
            <p>Loan Simulator React</p>
        </div>
    )
}