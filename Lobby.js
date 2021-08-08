let hide = document.createElement('div')

class Lobby {
    constructor() {
        this.node = document.createElement('div')
        this.node.classList.add('lobby')
        this.title = document.createElement('h1')
        this.title.innerText = "Select Match"
        this.node.appendChild(this.title)

        this.input = document.createElement('input')
        this.input.placeholder = 'Your Nick'
        this.node.appendChild(this.input)

        
        this.list = document.createElement('ul')
        this.node.appendChild(this.list)
                
        
        this.li = document.createElement('li')
        this.li.innerText = 'aaaaa'
        this.list.appendChild(this.li)
    }
    show(){
        document.body.appendChild(this.node)
    }
    hide(){
        hide.appendChild(this.node)
    }
}

export default Lobby

