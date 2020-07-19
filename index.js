'use strict';
const listDefault = document.querySelector('.dropdown-lists__list--default');
const listSelect = document.querySelector('.dropdown-lists__list--select');
const listAutocomplete = document.querySelector('.dropdown-lists__list--autocomplete');

class Cities{
    constructor(){
        this.listDefault = document.querySelector('.dropdown-lists__list--default');
        this.listSelect = document.querySelector('.dropdown-lists__list--select');
        this.listAutocomplete = document.querySelector('.dropdown-lists__list--autocomplete');
        this.input = document.getElementById('select-cities');
        this.selected = false;
        this.closeButton = document.querySelector('.close-button');
        this.wikiButton = document.querySelector('.button');
    }

    init(){
        this.wikiButton.setAttribute("disabled", "disabled");
        this.getData()
                .then(response => {
                    if(response.status !== 200) throw new Error('network status is not 200.');
                    return response.json()
                })
                .then(response => {
                    this.input.addEventListener('click', () => this.createDefaultList(response));
                    this.input.addEventListener('input', () => this.findCities(response));
                    this.wikiButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        if(this.wikiButton.href)
                            window.open(this.wikiButton.href, '_blank');
                    })
                    document.addEventListener('click', event => {
                        if(!event.target.closest('#select-cities') && !event.target.closest('.dropdown-lists__total-line') && !event.target.closest('.dropdown-lists__line') && !event.target.closest('.button')){
                            listDefault.querySelectorAll('.dropdown-lists__countryBlock').forEach(item => item.remove());
                            this.input.value = '';
                            this.closeButton.style.display = 'none';
                            this.wikiButton.setAttribute("disabled", "disabled");
                            this.wikiButton.removeAttribute('href');
                        }
                        else if(event.target.closest('.dropdown-lists__total-line') && !this.selected){
                            this.createSelectList(response, event.target.closest('.dropdown-lists__total-line').querySelector('.dropdown-lists__country'));
                        } 
                        else if(event.target.closest('.dropdown-lists__total-line') && this.selected){
                            listDefault.querySelectorAll('.dropdown-lists__countryBlock').forEach(item => item.remove());
                            this.input.value = '';
                            //this.closeButton.style.display = 'none';
                            this.createDefaultList(response);
                        } else if(event.target.closest('.dropdown-lists__line')){
                            this.input.value = event.target.closest('.dropdown-lists__line').querySelector('.dropdown-lists__city').textContent;
                            this.setCityLink(response, this.input.value);
                            this.closeButton.style.display = 'none';
                        } 
                    });
                })
                .catch(error => console.error(error));
    }

    setCityLink(response, town){
        response.RU.forEach(item => {
            item.cities.forEach(city => {
                if(city.name == town){
                    this.wikiButton.removeAttribute('disabled');
                    this.wikiButton.href = `${city.link}`;
                }
            });
        });
    }

    findCities(response){
        if(this.input.value.trim() !== ''){
            listDefault.querySelectorAll('.dropdown-lists__countryBlock').forEach(item => item.remove());
            const find = this.input.value.toLowerCase();
            const block = document.createElement('div');
            block.classList.add('dropdown-lists__countryBlock');
            response.RU.forEach(item => {
                item.cities.forEach(city => {
                    if(city.name.toLowerCase().startsWith(find)){
                        block.insertAdjacentHTML('beforeend', `
                            <div class="dropdown-lists__line">
                                <div class="dropdown-lists__city">${city.name}</div>
                                <div class="dropdown-lists__count">${item.country}</div>
                            </div>
                        `);
                    }
                });
                listDefault.append(block);
            });
            if(block.innerHTML.trim() === ''){
                block.insertAdjacentHTML('beforeend', `
                            <div class="dropdown-lists__line">
                                <div class="dropdown-lists__city">Ничего не найдено</div>
                                <div class="dropdown-lists__count"></div>
                            </div>
                        `);
                        this.wikiButton.href = ``;
                        this.wikiButton.setAttribute('disabled', 'disabled');
            }
        } else{
            listDefault.querySelectorAll('.dropdown-lists__countryBlock').forEach(item => item.remove());
            this.createDefaultList(response);
        }
    }

    createDefaultList(response){
        this.selected = false;
        this.closeButton.style.display = 'none';
        response.RU.forEach(item => {
            const block = document.createElement('div');
            const country = item.country;
            const count = item.count;

            block.classList.add('dropdown-lists__countryBlock');
            block.insertAdjacentHTML('beforeend', `
                <div class="dropdown-lists__total-line">
                    <div class="dropdown-lists__country">${country}</div>
                    <div class="dropdown-lists__count">${count}</div>
                </div>
            `);

            item.cities.forEach(city => city.count = +city.count);
            let arr = [];
            item.cities.forEach(city => arr.push(+city.count));
            
            const n = 3;
            let mostCities = [...arr].sort((a, b) => b - a).slice(0, n);
            mostCities = mostCities.reduce((acc, n) => (acc.push(arr.indexOf(n)), acc), []);


            mostCities.forEach((i, index) => {
                item.cities.forEach((city, inx) => {
                    if(inx == i){
                        if(index === 0){
                            block.insertAdjacentHTML('beforeend', `
                            <div class="dropdown-lists__line">
                                <div class="dropdown-lists__city dropdown-lists__city--ip">${city.name}</div>
                                <div class="dropdown-lists__count">${city.count}</div>
                            </div>
                        `)} else{
                            block.insertAdjacentHTML('beforeend', `
                                <div class="dropdown-lists__line">
                                    <div class="dropdown-lists__city">${city.name}</div>
                                    <div class="dropdown-lists__count">${city.count}</div>
                                </div>
                            `)
                        }
                        
                    }
                });
            });
            this.listDefault.append(block)
        })
    }

    createSelectList(response, target){
        this.selected = true;
        response.RU.forEach(item => {
            if(item.country == target.textContent){
                this.wikiButton.href = ``;
                this.input.value = item.country;
                this.closeButton.style.display = 'block';

                listDefault.querySelectorAll('.dropdown-lists__countryBlock').forEach(item => item.remove());

                const block = document.createElement('div');
                const country = item.country;
                const count = item.count;
    
                block.classList.add('dropdown-lists__countryBlock');
                block.insertAdjacentHTML('beforeend', `
                    <div class="dropdown-lists__total-line">
                        <div class="dropdown-lists__country">${country}</div>
                        <div class="dropdown-lists__count">${count}</div>
                    </div>
                `);
    
                item.cities.forEach(city => city.count = +city.count);
                let arr = [];
                item.cities.forEach(city => arr.push(+city.count));
                
                const n = 3;
                let mostCities = [...arr].sort((a, b) => b - a).slice(0, n);
                mostCities = mostCities.reduce((acc, n) => (acc.push(arr.indexOf(n)), acc), []);
    
                mostCities.forEach((i, index) => {
                    item.cities.forEach((city, inx) => {
                        if(inx == i){
                            if(index === 0){
                                block.insertAdjacentHTML('beforeend', `
                                    <div class="dropdown-lists__line">
                                        <div class="dropdown-lists__city dropdown-lists__city--ip">${city.name}</div>
                                        <div class="dropdown-lists__count">${city.count}</div>
                                    </div>
                                `)
                            } else{
                                block.insertAdjacentHTML('beforeend', `
                                    <div class="dropdown-lists__line">
                                        <div class="dropdown-lists__city">${city.name}</div>
                                        <div class="dropdown-lists__count">${city.count}</div>
                                    </div>
                                `)
                            }
                        }
                    });
                });
                this.listDefault.append(block);
            }
        })
    }

    getData(){
        return fetch('./db_cities.json');
    }
}

const cities = new Cities();
cities.init();